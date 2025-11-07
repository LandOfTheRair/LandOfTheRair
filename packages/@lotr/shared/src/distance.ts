export function distanceFrom(
  refPoint: { x: number; y: number },
  checkPoint: { x: number; y: number },
): number {
  return Math.max(
    Math.abs(refPoint.x - checkPoint.x),
    Math.abs(refPoint.y - checkPoint.y),
  );
}
