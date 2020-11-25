


export function distFrom(
  refPoint: { x: number, y: number }, 
  checkPoint: { x: number, y: number }, 
  vector?: { x: number, y: number }
): number {
  let checkX = refPoint.x;
  let checkY = refPoint.y;

  if (vector) {
    checkX += vector.x || 0;
    checkY += vector.y || 0;
  }

  return Math.floor(Math.sqrt(Math.pow(checkPoint.x - checkX, 2) + Math.pow(checkPoint.y - checkY, 2)));
}
