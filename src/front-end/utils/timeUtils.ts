import { TimeFrame } from "../components/ui/timeframe-selector"

export const timeFrameToMilliseconds = (tf: TimeFrame): number => {
  switch (tf) {
    case TimeFrame.DAILY: return 86400000 // 24 * 60 * 60 * 1000
    case TimeFrame.WEEKLY: return 604800000 // 7 * 24 * 60 * 60 * 1000
    case TimeFrame.MONTHLY: return 2592000000 // 30 * 24 * 60 * 60 * 1000
    default: return 86400000 // Default to daily
  }
}

export const millisecondsToTimeFrame = (ms: number): TimeFrame => {
  if (ms >= 2592000000) {
    return TimeFrame.MONTHLY;
  } else if (ms >= 604800000) {
    return TimeFrame.WEEKLY;
  } else {
    return TimeFrame.DAILY;
  }
}
