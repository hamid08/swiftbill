export interface ICacheTraceImei {
  Socket_VisitDateTime?: Date | null;
  Db_VisitDateTime?: Date | null;
}

export interface ICacheTracker {
  IMEI: string;
  TraceMode: boolean;
  TraceInfo: ICacheTraceImei;
}
