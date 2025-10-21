import { worldGetMapAndState } from '@lotr/core';
import { get, setWith, size } from 'lodash';

enum DarknessStatus {
  Lightness = -2,
  PermanentDarkness = -1,
  Clear = 0,
  Darkness = 1,
}

const darkness: Record<string, Record<number, Record<number, number>>> = {};

function updateDarkness(map: string, x: number, y: number): void {
  worldGetMapAndState(map).state?.triggerAndSendUpdateWithFOV(x, y);
}

function setDarkness(map: string, x: number, y: number, endsAt: number): void {
  setWith(darkness, [map, x, y], endsAt, Object);
}

function getDarkness(map: string, x: number, y: number): number {
  return get(darkness, [map, x, y], 0);
}

export function darknessCreateLight(
  map: string,
  x: number,
  y: number,
  endsAt: number,
): void {
  setWith(darkness, [map, x, y], -endsAt, Object);
}

export function darknessRemoveSingle(map: string, x: number, y: number): void {
  setWith(darkness, [map, x, y], 0, Object);
  updateDarkness(map, x, y);

  delete darkness[map]![x]![y];
  if (size(darkness[map]![x]) === 0) delete darkness[map]![x];
  if (size(darkness[map]) === 0) delete darkness[map];
}

export function darknessRemove(
  map: string,
  x: number,
  y: number,
  radius: number,
  lightEndsAt: number,
): void {
  const now = Date.now();

  for (let xx = x - radius; xx <= x + radius; xx++) {
    for (let yy = y - radius; yy <= y + radius; yy++) {
      const existingDarkness = getDarkness(map, xx, yy);

      // we can't override permanent darkness
      if (existingDarkness === DarknessStatus.PermanentDarkness) continue;

      // we also can't override lightness
      if (
        existingDarkness < DarknessStatus.Lightness &&
        now < -existingDarkness
      ) {
        continue;
      }

      darknessRemoveSingle(map, xx, yy);
      if (lightEndsAt) {
        darknessCreateLight(map, xx, yy, lightEndsAt);
      }
    }
  }
}

export function darknessCheckAll() {
  const now = Date.now();

  Object.keys(darkness).forEach((map) => {
    Object.keys(darkness[map]!).forEach((x) => {
      Object.keys(darkness[map]![+x]!).forEach((y) => {
        const timestamp = darkness[map]![+x]![+y] ?? 0;
        if (timestamp < DarknessStatus.Darkness) return;
        if (now < timestamp) return;

        darknessRemoveSingle(map, +x, +y);
      });
    });
  });
}

export function darknessCreate(
  map: string,
  x: number,
  y: number,
  radius: number,
  endsAt: number,
): void {
  const now = Date.now();

  for (let xx = x - radius; xx <= x + radius; xx++) {
    for (let yy = y - radius; yy <= y + radius; yy++) {
      const existingDarkness = getDarkness(map, xx, yy);

      // we can't override permanent darkness
      if (existingDarkness === DarknessStatus.PermanentDarkness) continue;

      // we also can't override lightness
      if (
        existingDarkness < DarknessStatus.Lightness &&
        now < -existingDarkness
      ) {
        continue;
      }

      if (
        existingDarkness === DarknessStatus.Clear ||
        (existingDarkness && existingDarkness < endsAt)
      ) {
        setDarkness(map, xx, yy, endsAt);
        updateDarkness(map, x, y);
      }
    }
  }
}

export function darknessCreatePermanent(
  map: string,
  x: number,
  y: number,
): void {
  darknessCreate(map, x, y, 0, -1);
}

export function darknessIsDarkAt(map: string, x: number, y: number): boolean {
  const checkDarkness = getDarkness(map, x, y);
  return (
    checkDarkness === DarknessStatus.PermanentDarkness ||
    checkDarkness > DarknessStatus.Darkness
  );
}
