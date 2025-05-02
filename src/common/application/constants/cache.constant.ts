export const CACHE_CONSTANTS = {
  DEFAULT_FIELD: 'data',
  KEYS: {
    Tracker: (imei: string): string => `Tracker_${imei}`,
    TrackersStartedTracing: (): string => `trackers_started_tracing`,
  },
};
