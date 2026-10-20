/** When a student may press "Join": 15 minutes before the lesson until an hour after it should have ended. */
export const JOIN_EARLY_MS = 15 * 60 * 1000;
export const JOIN_GRACE_MS = 60 * 60 * 1000;

export function joinWindow(startsAt: Date | string, durationMinutes: number) {
  const start = new Date(startsAt).getTime();
  return { opensAt: start - JOIN_EARLY_MS, closesAt: start + durationMinutes * 60_000 + JOIN_GRACE_MS };
}

export function joinState(startsAt: Date | string, durationMinutes: number, now = Date.now()): "early" | "open" | "closed" {
  const { opensAt, closesAt } = joinWindow(startsAt, durationMinutes);
  if (now < opensAt) return "early";
  if (now > closesAt) return "closed";
  return "open";
}
