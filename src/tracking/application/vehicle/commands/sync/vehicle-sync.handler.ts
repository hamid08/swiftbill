import { Inject, Injectable, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler, CommandBus } from '@nestjs/cqrs';
import { AppException, HTTP_CONSTANT, HttpService, ResultUtils } from 'src/common';
import { AppConfigService } from 'src/config';
import { BusinessRepository, PlaqueStatus, Vehicle, VehicleRepository, TrackerAssignmentMobileDto, TrackerAssignmentMobileVehicleSyncDto, TrackerAssignmentError, Business } from 'src/tracking/domain';
import { VehicleSyncCommand } from './vehicle-sync.command';
import { AuthService } from '../../../services';
import { VehicleFleetSyncResponse, VehicleTransportSyncResponse } from './vehicle-sync.models';
import { TrackerAssignmentMobileCommand } from '../../../tracker-assignment/commands/mobile';

type SyncResult = {
    total: number;
    businessId: number;
    businessExternalId: string;
    externalIds: string[];
};


@CommandHandler(VehicleSyncCommand)
export class VehicleSyncCommandHandler implements ICommandHandler<VehicleSyncCommand, void> {
    private readonly logger = new Logger(VehicleSyncCommandHandler.name);
    private readonly pageSize = 500;

    constructor(
        @Inject(HTTP_CONSTANT.SERVICES.TRANSPORT.SERVICE_NAME)
        private readonly httpTransportService: HttpService,
        @Inject(HTTP_CONSTANT.SERVICES.FLEET.SERVICE_NAME)
        private readonly httpFleetService: HttpService,
        private readonly appConfigService: AppConfigService,
        @Inject(VehicleRepository)
        private readonly vehicleRepository: VehicleRepository,
        @Inject(BusinessRepository)
        private readonly businessRepository: BusinessRepository,
        @Inject(AuthService)
        private readonly authService: AuthService,
        private readonly commandBus: CommandBus,
    ) { }

    async execute(command: VehicleSyncCommand): Promise<void> {
        const businesses = await this.validateBusinesses();
        const businessLookup = this.createBusinessLookup(businesses);

        const { total, externalIds, businessId, businessExternalId } = await this.syncVehiclesBasedOnMode(businessLookup);

        this.logger.log(`Total vehicles synchronized: ${total}`);
        await this.processTrackerAssignment(externalIds, businessExternalId);
    }

    private async validateBusinesses(): Promise<Business[]> {
        const businesses: Business[] = await this.businessRepository.getAllBusinesses();
        if (!businesses?.length) {
            throw AppException.BadRequest(
                'کسب و کاری یافت نشد - لطفا ابتدا همگام سازی کسب و کار را انجام دهید',
            );
        }
        return businesses;
    }

    private createBusinessLookup(businesses: Business[]): Record<string, number> {
        return businesses.reduce((acc, business) => {
            acc[business.getExternalId()] = business.getId();
            return acc;
        }, {} as Record<string, number>);
    }

    private async syncVehiclesBasedOnMode(businessLookup: Record<string, number>): Promise<SyncResult> {
        const { mode } = this.appConfigService.sync;
        return mode === 'Single'
            ? this.syncVehiclesWithTransport(businessLookup)
            : this.syncVehiclesWithCore(businessLookup);
    }

    private async syncVehiclesWithTransport(businessLookup: Record<string, number>): Promise<SyncResult> {
        const { accessKey } = this.appConfigService.sync.singleEndpoint;
        let pageIndex = 1;
        let totalVehiclesSynced = 0;
        const syncedExternalIds: string[] = [];

        while (true) {
            const vehicles = await this.fetchVehiclesWithTransport(pageIndex, this.pageSize, accessKey);
            if (!vehicles?.length) {
                this.logger.warn('No vehicles received from Transport.');
                break;
            }

            const { filteredCount, vehicleList, externalIds } = this.processVehicleBatch(vehicles, businessLookup);

            await this.vehicleRepository.upsertVehicles(vehicleList);
            syncedExternalIds.push(...externalIds);
            totalVehiclesSynced += filteredCount;
            pageIndex++;
        }

        return this.createSyncResult(totalVehiclesSynced, syncedExternalIds, businessLookup);
    }

    private async syncVehiclesWithCore(businessLookup: Record<string, number>): Promise<SyncResult> {
        const accessCredentialToken = await this.authService.getAccessToken();
        let pageIndex = 1;
        let totalVehiclesSynced = 0;
        const syncedExternalIds: string[] = [];

        while (true) {
            const vehicles = await this.fetchVehiclesWithFleet(pageIndex, accessCredentialToken);
            if (!vehicles?.length) {
                this.logger.warn('No vehicles received from Core.');
                break;
            }

            const { filteredCount, vehicleList, externalIds } = this.processVehicleBatch(vehicles, businessLookup);

            await this.vehicleRepository.upsertVehicles(vehicleList);
            syncedExternalIds.push(...externalIds);
            totalVehiclesSynced += filteredCount;
            pageIndex++;
        }

        return this.createSyncResult(totalVehiclesSynced, syncedExternalIds, businessLookup);
    }

    private processVehicleBatch(
        vehicles: Array<VehicleTransportSyncResponse | VehicleFleetSyncResponse>,
        businessLookup: Record<string, number>,
    ) {
        const filteredVehicles = vehicles.filter(vehicle => businessLookup[vehicle.businessId]);
        const vehicleList = this.createVehicleList(filteredVehicles, businessLookup);
        const externalIds = filteredVehicles.map(v => v.vehicleId);

        return {
            filteredCount: filteredVehicles.length,
            vehicleList,
            externalIds
        };
    }

    private createSyncResult(
        total: number,
        externalIds: string[],
        businessLookup: Record<string, number>,
    ): SyncResult {
        // Get the business ID from the first vehicle's business external ID
        const firstBusinessExternalId = externalIds.length > 0 ?
            Object.keys(businessLookup).find(key => businessLookup[key] === businessLookup[externalIds[0]]) :
            null;

        return {
            total,
            businessId: firstBusinessExternalId ? businessLookup[firstBusinessExternalId] : 0,
            businessExternalId: firstBusinessExternalId,
            externalIds,
        };
    }

    private createVehicleList(
        vehicles: Array<VehicleTransportSyncResponse | VehicleFleetSyncResponse>,
        businessLookup: Record<string, number>,
    ): Vehicle[] {
        return vehicles.map(vehicle => {
            const businessId = businessLookup[vehicle.businessId];
            const transportVehicle = vehicle as VehicleTransportSyncResponse;

            return Vehicle.create({
                businessId,
                externalId: vehicle.vehicleId,
                identity: vehicle.identity,
                plaqueStatus: vehicle.plaqueNo ? PlaqueStatus.HasPlaque : PlaqueStatus.NoPlaque,
                plaqueType: vehicle.plaqueType,
                name: vehicle.name,
                plaqueNo: vehicle.plaqueNo,
                userTypeId: vehicle.vehicleUserTypeId,
                userTypeName: vehicle.vehicleUserTypeCaption,
                vehicleModelId: vehicle.vehicleModelId,
                vehicleModelName: vehicle.vehicleModelCaption,
                companyName: transportVehicle?.companyName,
                image: transportVehicle?.vehicleUserTypeIcon,
                imei: transportVehicle?.imei,
            });
        });
    }

    private async processTrackerAssignment(externalIds: string[], businessExternalId: string): Promise<void> {
        try {
            if (!externalIds.length) return;

            this.logger.debug('Starting Assignment Mobile Device Process...');
            const vehicleSyncDto: TrackerAssignmentMobileVehicleSyncDto = {
                externalIds,
                isDefault: true,
            };

            await this.commandBus.execute(
                new TrackerAssignmentMobileCommand(businessExternalId, undefined, vehicleSyncDto, true),
            );
        } catch (error) {
            this.logger.error('Error during tracker assignment process', error);
            throw AppException.BadRequest(`بروزرسانی خودروها با موفقیت انجام شد , اما اختصاص خودکار دستگاه موبایل با مشکل مواجه شد : ${error.message}`);
        }
    }

    private async fetchVehiclesWithTransport(
        pageIndex: number,
        pageSize: number,
        accessKey: string,
    ): Promise<VehicleTransportSyncResponse[] | null> {
        try {
            const response = await this.httpTransportService.get<VehicleTransportSyncResponse[]>(
                HTTP_CONSTANT.SERVICES.TRANSPORT.API.GET_VEHICLES(pageIndex, pageSize, accessKey),
            );
            return this.handleApiResponse(response);
        } catch (error) {
            this.logError('Error fetching vehicles from Transport', error);
            throw new Error('خطا در دریافت اطلاعات از سرویس transport');
        }
    }

    private async fetchVehiclesWithFleet(
        pageIndex: number,
        accessCredentialToken: string,
    ): Promise<VehicleFleetSyncResponse[] | null> {
        try {
            const response = await this.httpFleetService.get<VehicleFleetSyncResponse[]>(
                HTTP_CONSTANT.SERVICES.FLEET.API.GET_VEHICLES(pageIndex),
                { headers: this.getFleetRequestHeaders(accessCredentialToken) },
            );
            return this.handleApiResponse(response);
        } catch (error) {
            this.logError('Error fetching vehicles from Core', error);
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

    private getFleetRequestHeaders(token: string): Record<string, string> {
        return { Authorization: `Bearer ${token}` };
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