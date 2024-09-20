import { Operation } from 'fast-json-patch';

export const shouldSendPatch = (p: Operation): boolean => {
  if (p.path.includes('/effects/_hash')) return true;

  // remove these patches since they're mostly superfluous
  if (
    p.path === '/combatTicks' &&
    p.op === 'replace' &&
    p.value !== 0 &&
    p.value !== 5
  ) {
    return false;
  }

  // ideally, it would not generate these patches, but we take what we can
  if (['/x', '/y', '/dir', '/corpseRef'].includes(p.path)) return false;
  if (p.path.includes('createdAt')) return false;
  if (p.path.includes('currentTick')) return false;
  if (p.path.includes('fov')) return false;
  if (p.path.includes('_')) return false;

  return true;
};

export const modifyPatch = (patch: Operation): Operation => patch;
