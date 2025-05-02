import { Inject, Injectable, Logger } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetDeviceTracingResultQuery } from "./get-device-tracing-result.query";
import { DeviceTracingResponse, DeviceTracingServiceResponse, TrackingEnvironmentTypeResponse, TrackingServiceTypeResponse } from "./get-device-tracing.models";
import { AppConfigService } from "src/config";
import { AppException, CACHE_CONSTANTS, HTTP_CONSTANT, HttpService, ResultUtils } from "src/common";
import { CacheService } from "src/tracking/application/services";
import { ICacheTracker } from "src/tracking/application/services";
import { TrackerRepository } from "src/tracking/domain";

@QueryHandler(GetDeviceTracingResultQuery)
export class GetDeviceTracingResultQueryHandler
    implements IQueryHandler<GetDeviceTracingResultQuery, DeviceTracingResponse> {
    private readonly logger = new Logger(GetDeviceTracingResultQueryHandler.name);
    private readonly cloudServiceTypes = [
        TrackingServiceTypeResponse.DataReception,
        TrackingServiceTypeResponse.DataProcessing,
        TrackingServiceTypeResponse.DataDistribution
    ];

    constructor(
        private readonly appConfigService: AppConfigService,
        @Inject(HTTP_CONSTANT.SERVICES.TRACKING_AGENT.SERVICE_NAME)
        private readonly httpTrackingAgentService: HttpService,
        @Inject(CacheService)
        private readonly cacheService: CacheService,
        @Inject(TrackerRepository)
        private readonly trackerRepository: TrackerRepository,
    ) { }

    async execute(query: GetDeviceTracingResultQuery): Promise<DeviceTracingResponse> {
        const { imei } = query;

        // Parallelize data fetching
        const [trackerLatestData, trackerInfo] = await Promise.all([
            this.trackerRepository.getLatestTracingDataByImei(imei),
            this.cacheService.hGetAll<ICacheTracker>(CACHE_CONSTANTS.KEYS.Tracker(imei))
        ]);

        const { lastTrackedAt, lastConnectedAt, location } = trackerLatestData || {};

        if (!trackerInfo || !trackerInfo.TraceMode) {
            this.logger.debug(`Tracker ${imei} not found in cache for get device tracing result`);
            return this.buildNonTracingResponse(lastTrackedAt, lastConnectedAt);
        }

        // Parallelize service checks
        const [cloudTracingResult, localTracingResult] = await Promise.all([
            this.fetchCloudTracingResult(imei),
            this.fetchLocalTracingResult(trackerInfo)
        ]);

        return {
            isTracing: true,
            lastTrackingTime: lastTrackedAt,
            trackerLastConnectionTime: lastConnectedAt,
            services: [...cloudTracingResult, ...localTracingResult],
        };
    }

    private buildNonTracingResponse(
        lastTrackedAt: Date | null,
        lastConnectedAt: Date | null
    ): DeviceTracingResponse {
        return {
            isTracing: false,
            lastTrackingTime: lastTrackedAt,
            trackerLastConnectionTime: lastConnectedAt,
            services: [],
        };
    }

    private async fetchCloudTracingResult(
        imei: string,
    ): Promise<DeviceTracingServiceResponse[]> {
        try {
            const response = await this.httpTrackingAgentService.get<DeviceTracingServiceResponse[]>(
                HTTP_CONSTANT.SERVICES.TRACKING_AGENT.API.GET_DEVICE_TRACING_RESULT(imei),
                {
                    headers: this.getTrackingAgentRequestHeaders(this.appConfigService.trackingAgent.communicationGuardToken),
                },
            );

            const result = this.handleApiResponse<DeviceTracingServiceResponse[]>(response);
            if (result && result.length > 0) {
                return result;
            }

            // Return default successful services if no result
            return this.cloudServiceTypes.map(serviceType => ({
                isTraceSuccessful: true,
                serviceType: TrackingEnvironmentTypeResponse.Cloud,
                systemType: serviceType,
                visitDateTime: null,
            }));
        } catch (error) {
            this.logError('Error fetching device tracing result from Tracking Agent', error);
            return [];
        }
    }

    private async fetchLocalTracingResult(
        trackerInfo: ICacheTracker,
    ): Promise<DeviceTracingServiceResponse[]> {
        const { TraceInfo } = trackerInfo;
        const services: DeviceTracingServiceResponse[] = [];

        // Handle LocalDataReception
        services.push(this.buildLocalServiceResponse(
            TraceInfo.Socket_VisitDateTime,
            TrackingServiceTypeResponse.LocalDataReception
        ));

        // Handle DataStorageAndFinalProcessing
        services.push(this.buildLocalServiceResponse(
            TraceInfo.Db_VisitDateTime,
            TrackingServiceTypeResponse.DataStorageAndFinalProcessing
        ));

        return services;
    }

    private buildLocalServiceResponse(
        visitDateTime: Date | null,
        systemType: TrackingServiceTypeResponse
    ): DeviceTracingServiceResponse {
        return {
            isTraceSuccessful: !!visitDateTime,
            serviceType: TrackingEnvironmentTypeResponse.Local,
            systemType,
            visitDateTime,
        };
    }

    private handleApiResponse<T>(response: any): T | null {
        const result = ResultUtils.getOperationResult<T>(response.data);

        if (!result?.success) {
            this.logAndHandleInvalidResult(result?.messages);
            return null;
        }

        return result.data || null;
    }

    private logAndHandleInvalidResult(messages: string[] = []): void {
        const errorMessage = messages.length ? messages.join(' - ') : 'No error message provided.';
        this.logger.error(
            HTTP_CONSTANT.ERROR_MESSAGES.GUID_ERROR(
                HTTP_CONSTANT.SERVICES.TRACKING_AGENT.SERVICE_NAME,
                errorMessage,
            ),
        );
    }

    private getTrackingAgentRequestHeaders(communicationGuardToken: string): Record<string, string> {
        return {
            communicationGuardToken: communicationGuardToken,
        };
    }

    private logError(context: string, error: any): void {
        const errorMessage = `${context}: ${error.message}, ${error.response?.data || error.errors?.[0]?.message || ''}`;
        this.logger.error(errorMessage);
    }
}