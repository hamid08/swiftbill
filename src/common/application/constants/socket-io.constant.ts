export const SOCKET_IO_CONSTANTS = {
  EVENTS: {
    CONNECTION_EVENT: {
      AUTHENTICATED: 'connection:authenticated',
      ESTABLISHED: 'connection:established',
      ERROR: 'connection:error',
    },

    ROOM_EVENT: {
      JOIN_REQUEST: 'room:join:request',
      JOIN_SUCCESS: 'room:join:success',
      JOIN_REJECTED: 'room:join:rejected',
    },

    // Tracking Data Events
    TRACKER_EVENT: {
      ONLINE_TRACKERS_LOCATION: 'online:trackers:location',
      TRACKER_REALTIME_DATA: 'tracker:realtime:data',
      TRACKER_REALTIME_EVENT: 'tracker:realtime:event',
    },

    // Partner Integration Events
    PARTNER_EVENT: {
      REALTIME_DATA: 'partner-realtime:data',
    },

    PARTNER_ROOM_EVENT: {
      JOIN_REQUEST: 'partner-room:join:request',
      JOIN_SUCCESS: 'partner-room:join:success',
      JOIN_REJECTED: 'partner-room:join:rejected',
    },

  },

  MESSAGES: {
    // Connection Messages
    CONNECT_SUCCESS: (socketId: string) =>
      `🔗 Client connected (ID: ${socketId})`,
    DISCONNECT: (socketId: string) =>
      `⚠️ Client disconnected (ID: ${socketId})`,

    // Room Messages
    ROOM_JOIN_SUCCESS: (roomId: string, socketId: string) =>
      `✓ [${socketId}] Joined room: ${roomId}`,
    ROOM_JOIN_REJECTED: (roomId: string, reason: string) =>
      `🚫 Cannot join ${roomId}: ${reason}`,

    // Authentication Messages
    AUTH_SUCCESS: (userId: string) =>
      `🔐 Authenticated user ${userId}`,
    AUTH_FAILURE: (error: string) =>
      `🛡️ Auth failed: ${error}`,

    // Tracking Messages
    TRACKER_DATA_RECEIVED: (trackerId: string) =>
      `📡 Received data from tracker ${trackerId}`,
    TRACKER_OFFLINE: (trackerId: string) =>
      `⚡ Tracker ${trackerId} went offline`,

    // Partner Messages
    PARTNER_CONNECTED: (partnerId: string) =>
      `🤝 Partner ${partnerId} connected`,
    PARTNER_DATA_SENT: (partnerId: string) =>
      `📤 Sent data to partner ${partnerId}`,
    PARTNER_AUTH_FAILED: (partnerId: string) =>
      `🛑 Partner ${partnerId} authentication failed`,
  },

  ERROR_CODES: {
    ROOM_FULL: 'ROOM_FULL',
    AUTH_TIMEOUT: 'AUTH_TIMEOUT',
    PERMISSION_DENIED: 'PERMISSION_DENIED',
    // Partner-specific error codes
    PARTNER_QUOTA_EXCEEDED: 'PARTNER_QUOTA_EXCEEDED',
    PARTNER_SERVICE_DISABLED: 'PARTNER_SERVICE_DISABLED',
  },

};