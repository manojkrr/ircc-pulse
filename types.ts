export type ProgramRow = {
  program: string;
  programFull: string;
  totalPeopleText?: string;
  currentFlpt?: string;
  waiting?: number;
  waitingFormatted?: string;
  flptMonths?: number;
  incompleteReason?: "missing-total-people" | "missing-current-flpt" | "both";
};

export type CategoryMonthRow = {
  program: string;
  ym: string;           // "YYYY/MM"
  value?: number;
  bound?: "lt" | "gt" | "approx" | "exact" | "unknown";
  raw: string;
};

export type WaitTimeStatusRow = {
  program: string;
  ym: string;
  // FIX: Removed "other" to match what `parseWaitTimeStatus` can return.
  status: "not_enough_data" | "need_more_time" | "unknown";
  raw: string;
};

export type PeopleAheadTrend = {
  program: string;
  programFull: string;
  window: number;
  latestYm?: string;
  latestValue?: number;
  prevYm?: string;
  prevValue?: number;
  momPct?: number;
  cmgrPct?: number;
  slopePerMonth?: number;
  r2?: number;
  direction: "up" | "down" | "flat";
};