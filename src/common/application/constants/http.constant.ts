export const HTTP_CONSTANT = {
    SERVICES: {
        TRACKING_MANAGEMENT: {
            SERVICE_NAME: 'TrackingManagementService',
            API: {
                DEVICE_TRACING_STATUS: '/api/agent/device-tracing-status',
                GET_MANAGEMENT_DATA: '/api/agent/get-management-data',
                REGISTER_DEVICES: '/api/agent/register-devices',
                START_DEVICE_TRACING: '/api/agent/start-device-tracing',
                STOP_DEVICES_TRACING: '/api/agent/stop-devices-tracing',
                ACTIVATE_TRACKER_EXTENSION: '/api/agent/activate-tracker-extension',
                DEACTIVATE_TRACKER_EXTENSION: '/api/agent/deactivate-tracker-extension',
            },
        },

        TRANSPORT: {
            SERVICE_NAME: 'TransportService',
            API: {
                GET_BUSINESSES: (accessKey: string) =>
                    `/api/trackingPanel/getListBusiness?accessKey=${accessKey}`,
                GET_VEHICLES: (pageIndex: number, pageSize: number, accessKey: string) =>
                    `/api/trackingPanel/getVehicles?pageIndex=${pageIndex}&pageSize=${pageSize}&accessKey=${accessKey}`,
                GET_USERS: (pageIndex: number, pageSize: number, accessKey: string) =>
                    `/api/trackingPanel/getUsers?pageIndex=${pageIndex}&pageSize=${pageSize}&accessKey=${accessKey}`,
                GET_CURRENT_DRIVER: (vehicleId: string, accessKey: string) =>
                    `/api/trackingPanel/getCurrentDriver/${vehicleId}?accessKey=${accessKey}`,
            },
        },

        CORE: {
            SERVICE_NAME: 'CoreService',
            API: {
                GET_BUSINESSES: (pageIndex: number, module: string) =>
                    `/api/SyncData/GetBusinessesList?page=${pageIndex}&module=${module}`,
                GET_USERS: (pageIndex: number, module: string) =>
                    `/api/SyncData/GetUsersList?page=${pageIndex}&module=${module}`,
            },
        },

        FLEET: {
            SERVICE_NAME: 'FleetService',
            API: {
                GET_VEHICLES: (pageIndex: number) =>
                    `/api/SyncData/GetVehiclesList?page=${pageIndex}`,
            },
        },

        AUTH: {
            SERVICE_NAME: 'AuthService',
            API: {
                GET_TOKEN: `/connect/token`,
            },
        },
        TRACKING_AGENT: {
            SERVICE_NAME: 'TrackingAgentService',
            API: {
                GET_DEVICE_TRACING_RESULT: (imei: string) => //Note:Send communicationGuardToken to header
                    `/api/tracing-data/${imei}/result`,
            },
        },
        NESHAN: {
            SERVICE_NAME: 'NeshanService',
            API: {
                REVERSE_GEOCODE: (latitude: number, longitude: number) =>
                    `?lat=${latitude}&lng=${longitude}`,
            },
        },
        OPEN_WEATHER: {
            SERVICE_NAME: 'OpenWeatherService',
            API: {
                GET_WEATHER_DATA: (latitude: number, longitude: number, apiKey: string) =>
                    `?lat=${latitude}&lon=${longitude}&appid=${apiKey}`,
            },
        },
    },

    ERROR_MESSAGES: {
        GUID_ERROR: (httpAddress: string, reason: string) =>
            `HTTP request failed. Address: ${httpAddress}, Reason: ${reason}`,
    },
};