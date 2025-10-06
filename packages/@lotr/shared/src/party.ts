

export function getMultiplierBasedOnPartySize(partySize: number): number {
  if (partySize <= 4)  return 1;
  if (partySize <= 5)  return 0.85;
  if (partySize <= 6)  return 0.6;
  if (partySize <= 8)  return 0.4;
  if (partySize <= 10) return 0.2;
  return 0.05;
}

export function getMultiplierBasedOnLevelDifference(level: number): number {
  if (level <= 5) return 1;
  if (level <= 10) return 0.5;
  if (level <= 20) return 0.25;
  if (level <= 30) return 0.1;
  return 0.01;
}
