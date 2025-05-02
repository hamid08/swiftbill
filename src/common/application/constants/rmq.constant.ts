export const RMQ_CONSTANT = {
  TRACKER_REALTIME_EVENT: {
    EXCHANGE: 'tracking-events-realtime', // Type: Fanout, { durable: true }
    QUEUE: 'tracking-events-realtime',    //{ durable: false, autoDelete: true, arguments: { 'x-message-ttl': 120000, 'x-expires': 86400000 } }
  },

  TRACKING_REALTIME_DATA: {
    EXCHANGE: 'tracking-data-v9', // Type: Fanout, { durable: true }
    QUEUE: 'tracking-data-service',    // { durable: false, autoDelete: true, arguments: { 'x-message-ttl': 120000, 'x-expires': 86400000 } }
  },

  SYNC_MANAGEMENT_DATA: {
    EXCHANGE: 'tracking-management-data-request', // Type: Direct, { durable: true, arguments: { 'x-queue-type': 'quorum' } }
    QUEUE: 'tracking-management-data-request',    // { durable: true, arguments: { 'x-queue-type': 'quorum' } }
  },

  REGISTER_DEVICES: {
    EXCHANGE: 'tracking-device-registration-request', // Type: Direct, { durable: true, arguments: { 'x-queue-type': 'quorum' } }
    QUEUE: 'tracking-device-registration-request',    // { durable: true, arguments: { 'x-queue-type': 'quorum' } }
  },

  COMMAND_DEVICE: {
    EXCHANGE: 'tracking-device-commands', // Type: Direct, { durable: true, arguments: { 'x-queue-type': 'quorum' } }
    QUEUE: 'tracking-device-commands',    // { durable: true, arguments: { 'x-queue-type': 'quorum' } }
  },

  TRACE_DEVICE: {
    START: {
      EXCHANGE: 'tracking-trace-device-start-request', // Type: Direct, { durable: true, arguments: { 'x-queue-type': 'quorum' } }
      QUEUE: 'tracking-trace-device-start-request',    // { durable: true, arguments: { 'x-queue-type': 'quorum' } }
    },
    STOP: {
      EXCHANGE: 'tracking-trace-device-stop-request', // Type: Direct, { durable: true, arguments: { 'x-queue-type': 'quorum' } }
      QUEUE: 'tracking-trace-device-stop-request',    // { durable: true, arguments: { 'x-queue-type': 'quorum' } }
    },
  },

  TRACKING_EXTENSION: {
    ACTIVATE: {
      EXCHANGE: 'tracking-extension-activate-request', // Type: Direct, { durable: true, arguments: { 'x-queue-type': 'quorum' } }
      QUEUE: 'tracking-extension-activate-request',    // { durable: true, arguments: { 'x-queue-type': 'quorum' } }
    },
    DEACTIVATE: {
      EXCHANGE: 'tracking-extension-deactivate-request', // Type: Direct, { durable: true, arguments: { 'x-queue-type': 'quorum' } }
      QUEUE: 'tracking-extension-deactivate-request',    // { durable: true, arguments: { 'x-queue-type': 'quorum' } }
    }
  },

  TRACKING_TRIP: {
    CREATION: {
      EXCHANGE: 'tracking-trips', // Type: Direct, { durable: true, arguments: { 'x-queue-type': 'quorum' } }
      QUEUE: 'tracking-trips',    // { durable: true, arguments: { 'x-queue-type': 'quorum' } }
    }
  },

  TRACKING_SETTING: {
    SCENARIO: {
      EXCHANGE: 'tracking-scenario-settings', // Type: Direct, { durable: true, arguments: { 'x-queue-type': 'quorum' } }
      QUEUE: 'tracking-scenario-settings',    // { durable: true, arguments: { 'x-queue-type': 'quorum' } }
    }

  },

  TRANSPORT: {
    VEHICLE_SYNC: {
      EXCHANGE: 'VehiclesExchange', // Type: Fanout, { durable: true }
      QUEUE: 'tracking-service-transport-vehicles',    // { durable: true, arguments: { 'x-queue-type': 'quorum' } }
    },
    BUSINESS_SYNC: {
      EXCHANGE: 'BusinessesExchange', // Type: Fanout, { durable: true }
      QUEUE: 'tracking-service-transport-businesses',    // { durable: true, arguments: { 'x-queue-type': 'quorum' } }
    },
    USER_SYNC: {
      EXCHANGE: 'UsersExchange', // Type: Direct, { durable: true }
      QUEUE: 'tracking-service-transport-users',    // { durable: true, arguments: { 'x-queue-type': 'quorum' } }
    },
  },

};
