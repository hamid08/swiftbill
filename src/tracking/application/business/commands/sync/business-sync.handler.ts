import { Inject, Injectable, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { APPLICATION_CONSTANT, AppException, HTTP_CONSTANT, HttpService, RMQ_CONSTANT, ResultUtils } from 'src/common';
import { AppConfigService } from 'src/config';
import { BusinessSyncCommand } from './business-sync.command';
import { BusinessCoreSyncResponse, BusinessTransportSyncResponse } from './business-sync.models';
import { Business, BusinessRepository } from 'src/tracking/domain';
import { AuthService } from '../../../services';

@CommandHandler(BusinessSyncCommand)
export class BusinessSyncCommandHandler implements ICommandHandler<BusinessSyncCommand, void> {
    private readonly logger = new Logger(BusinessSyncCommandHandler.name);

    constructor(
        @Inject(HTTP_CONSTANT.SERVICES.TRANSPORT.SERVICE_NAME)
        private readonly httpTransportService: HttpService,
        @Inject(HTTP_CONSTANT.SERVICES.CORE.SERVICE_NAME)
        private readonly httpCoreService: HttpService,
        private readonly appConfigService: AppConfigService,
        @Inject(BusinessRepository)
        private readonly businessRepository: BusinessRepository,
        @Inject(AuthService)
        private readonly authService: AuthService,
    ) { }

    async execute(command: BusinessSyncCommand): Promise<void> {
        const { mode } = this.appConfigService.sync;

        let totalBusinessesSynced = 0;

        if (mode === 'Single') {
            totalBusinessesSynced = await this.syncBusinessesWithTransport();
        } else {
            totalBusinessesSynced = await this.syncBusinessesWithCore();
        }

        this.logger.log(`Total businesses synchronized: ${totalBusinessesSynced}`);

    }

    private async syncBusinessesWithTransport(): Promise<number> {
        const { accessKey } = this.appConfigService.sync.singleEndpoint;
        let totalBusinessesSynced = 0;

        const businesses = await this.fetchBusinessesWithTransport(accessKey);

        if (!businesses || businesses.length === 0) {
            this.logger.warn('No businesses received from Transport.');
            return 0;
        }

        const businessList = businesses.map((business) =>
            Business.create(business.businessId, business.caption, business.image),
        );

        await this.businessRepository.upsertBusinesses(businessList);
        totalBusinessesSynced += businesses.length;

        return totalBusinessesSynced;
    }

    private async syncBusinessesWithCore(): Promise<number> {
        const accessCredentialToken = await this.authService.getAccessToken();
        let pageIndex = 1;
        let totalBusinessesSynced = 0;

        while (true) {
            const businesses = await this.fetchBusinessesWithCore(pageIndex, accessCredentialToken);

            if (!businesses || businesses.length === 0) {
                this.logger.warn('No businesses received from Core.');
                break;
            }

            const businessList = businesses.map((business) =>
                Business.create(business.id, business.brandName),
            );

            await this.businessRepository.upsertBusinesses(businessList);
            totalBusinessesSynced += businesses.length;
            pageIndex++;
        }

        return totalBusinessesSynced;
    }

    private async fetchBusinessesWithTransport(
        accessKey: string,
    ): Promise<BusinessTransportSyncResponse[] | null> {
        try {
            const response = await this.httpTransportService.get<BusinessTransportSyncResponse[]>(
                HTTP_CONSTANT.SERVICES.TRANSPORT.API.GET_BUSINESSES(accessKey),
            );

            return this.handleApiResponse(response);
        } catch (error) {
            this.logError('Error fetching businesses from Transport', error);
            throw new Error('خطا در دریافت اطلاعات از سرویس transport');
        }
    }

    private async fetchBusinessesWithCore(
        pageIndex: number,
        accessCredentialToken: string,
    ): Promise<BusinessCoreSyncResponse[] | null> {
        try {
            const response = await this.httpCoreService.get<BusinessCoreSyncResponse[]>(
                HTTP_CONSTANT.SERVICES.CORE.API.GET_BUSINESSES(pageIndex,APPLICATION_CONSTANT.MODULE_NAME),
                {
                    headers: this.getCoreRequestHeaders(accessCredentialToken),
                },
            );

            return this.handleApiResponse(response);
        } catch (error) {
            this.logError('Error fetching businesses from Core', error);
            throw new Error('خطا در دریافت اطلاعات از سرویس core');
        }
    }

    private handleApiResponse<T>(response: any): T | null {
        const result = ResultUtils.getOperationResult<T>(response.data);

        if (!result?.success) {
            this.logAndHandleInvalidResult(result?.messages);
            return null;
        }

        return result.data || null;
    }

    private getCoreRequestHeaders(token: string): Record<string, string> {
        return {
            Authorization: `Bearer ${token}`,
        };
    }

    private logAndHandleInvalidResult(messages: string[] = []): void {
        const errorMessage = messages.length ? messages.join(' - ') : 'No error message provided.';
        this.logger.error(
            HTTP_CONSTANT.ERROR_MESSAGES.GUID_ERROR(
                HTTP_CONSTANT.SERVICES.TRANSPORT.SERVICE_NAME,
                errorMessage,
            ),
        );
    }

    private logError(context: string, error: any): void {
        const errorMessage = `${context}: ${error.message}, ${error.response?.data || error.errors?.[0]?.message || ''}`;
        this.logger.error(errorMessage);
    }
}