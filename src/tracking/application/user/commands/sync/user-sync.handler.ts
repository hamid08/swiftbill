import { Inject, Injectable, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { APPLICATION_CONSTANT, HTTP_CONSTANT, HttpService, ResultUtils } from 'src/common';
import { AppConfigService } from 'src/config';
import { User, UserRepository } from 'src/tracking/domain';
import { UserSyncCommand } from './user-sync.command';
import { AuthService } from '../../../services';
import { UserCoreSyncResponse, UserTransportSyncResponse } from './user-sync.models';


@CommandHandler(UserSyncCommand)
export class UserSyncCommandHandler implements ICommandHandler<UserSyncCommand, void> {
    private readonly logger = new Logger(UserSyncCommandHandler.name);

    constructor(
        @Inject(HTTP_CONSTANT.SERVICES.TRANSPORT.SERVICE_NAME)
        private readonly httpTransportService: HttpService,
        @Inject(HTTP_CONSTANT.SERVICES.CORE.SERVICE_NAME)
        private readonly httpCoreService: HttpService,
        private readonly appConfigService: AppConfigService,
        @Inject(UserRepository)
        private readonly userRepository: UserRepository,
        @Inject(AuthService)
        private readonly authService: AuthService,
    ) { }

    async execute(command: UserSyncCommand): Promise<void> {
        const { mode } = this.appConfigService.sync;

        let totalUsersSynced = 0;

        if (mode === 'Single') {
            totalUsersSynced = await this.syncUsersWithTransport();
        } else {
            totalUsersSynced = await this.syncUsersWithCore();
        }

        this.logger.log(`Total users synchronized: ${totalUsersSynced}`);
    }

    private async syncUsersWithTransport(): Promise<number> {
        const { accessKey } = this.appConfigService.sync.singleEndpoint;
        const pageSize = 500;
        let pageIndex = 1;
        let totalUsersSynced = 0;

        while (true) {
            const users = await this.fetchUsersWithTransport(pageIndex, pageSize, accessKey);
            if (!users || users.length === 0) {
                this.logger.warn('No users received from Transport.');
                break;
            }

            const userList = this.createUserList(users);
            await this.userRepository.upsertUsers(userList);
            totalUsersSynced += userList.length;
            pageIndex++;
        }

        return totalUsersSynced;
    }

    private async syncUsersWithCore(): Promise<number> {
        const accessCredentialToken = await this.authService.getAccessToken();
        let pageIndex = 1;
        let totalUsersSynced = 0;

        while (true) {
            const users = await this.fetchUsersWithCore(pageIndex, accessCredentialToken);
            if (!users || users.length === 0) {
                this.logger.warn('No users received from Core.');
                break;
            }

            const userList = this.createUserList(users);
            await this.userRepository.upsertUsers(userList);
            totalUsersSynced += userList.length;
            pageIndex++;
        }

        return totalUsersSynced;
    }

    private createUserList(
        users: UserTransportSyncResponse[] | UserCoreSyncResponse[],
    ): User[] {
        return users.map((user) => {
            const externalId = 'userId' in user ? user.userId : user.userInfo.id;
            const username = 'userName' in user ? user.userName : user.userInfo.userName;
            const businessExternalIds = 'businessIds' in user ? user.businessIds : (user as UserCoreSyncResponse).businessUserInfos.map(info => info.businessId);
            const displayName =
                'fullName' in user
                    ? user.fullName
                    : `${user.userInfo.firstName} ${user.userInfo.lastName}`;

            return User.create({
                externalId,
                username,
                displayName,
                businessExternalIds,
            });
        });
    }

    private async fetchUsersWithTransport(
        pageIndex: number,
        pageSize: number,
        accessKey: string,
    ): Promise<UserTransportSyncResponse[] | null> {
        try {
            const response = await this.httpTransportService.get<UserTransportSyncResponse[]>(
                HTTP_CONSTANT.SERVICES.TRANSPORT.API.GET_USERS(pageIndex, pageSize, accessKey),
            );

            return this.handleApiResponse(response);
        } catch (error) {
            this.logError('Error fetching users from Transport', error);
            throw new Error('خطا در دریافت اطلاعات از سرویس transport');
        }
    }

    private async fetchUsersWithCore(
        pageIndex: number,
        accessCredentialToken: string,
    ): Promise<UserCoreSyncResponse[] | null> {
        try {
            const response = await this.httpCoreService.get<UserCoreSyncResponse[]>(
                HTTP_CONSTANT.SERVICES.CORE.API.GET_USERS(pageIndex, APPLICATION_CONSTANT.MODULE_NAME),
                {
                    headers: this.getCoreRequestHeaders(accessCredentialToken),
                },
            );

            return this.handleApiResponse(response);
        } catch (error) {
            this.logError('Error fetching users from Core', error);
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