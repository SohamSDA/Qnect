import { Token, TokenStatus } from "../token.model.js";

const DEFAULT_SERVICE_TIME_MINUTES = 5;
const MAX_SERVICE_TIME_MINUTES = 60;
const RECENT_COMPLETED_SAMPLE_SIZE = 20;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

async function getAverageServiceTimeMinutes(queueId: string): Promise<number> {
  const completedTokens = await Token.find({
    queue: queueId,
    status: TokenStatus.COMPLETED,
  })
    .sort({ updatedAt: -1 })
    .limit(RECENT_COMPLETED_SAMPLE_SIZE)
    .select("createdAt updatedAt")
    .lean();

  if (!completedTokens.length) {
    return DEFAULT_SERVICE_TIME_MINUTES;
  }

  const durations = completedTokens
    .map((token) => (token.updatedAt.getTime() - token.createdAt.getTime()) / 60000)
    .filter((minutes) => Number.isFinite(minutes) && minutes > 0);

  if (!durations.length) {
    return DEFAULT_SERVICE_TIME_MINUTES;
  }

  const avgMinutes = durations.reduce((sum, current) => sum + current, 0) / durations.length;
  return clamp(avgMinutes, 1, MAX_SERVICE_TIME_MINUTES);
}

export async function getQueueEstimatedWait(
  queueId: string,
  options?: { waitingCount?: number; activeCounters?: number },
): Promise<number> {
  const waitingCount =
    options?.waitingCount ??
    (await Token.countDocuments({
      queue: queueId,
      status: TokenStatus.WAITING,
    }));

  if (waitingCount <= 0) {
    return 0;
  }

  const activeCounters = Math.max(options?.activeCounters ?? 1, 1);
  const averageServiceTime = await getAverageServiceTimeMinutes(queueId);

  return Math.ceil((waitingCount * averageServiceTime) / activeCounters);
}
