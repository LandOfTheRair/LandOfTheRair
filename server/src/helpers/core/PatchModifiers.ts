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

  if (p.op === 'replace' && p.path.includes('/statistics')) return false;

  if (
    p.op === 'replace' &&
    p.path.includes('/npcs') &&
    p.path.includes('/mp')
  ) {
    return false;
  }

  if (
    p.op === 'replace' &&
    p.path.includes('/allegianceReputation') &&
    ![-102, -101, -100, -99, -98, 98, 99, 100, 101, 102].includes(p.value)
  ) {
    return false;
  }

  if (
    p.op === 'replace' &&
    p.path.includes('/condition') &&
    ![0, 1, 4999, 5000, 5001, 9999, 10000, 10001].includes(p.value)
  ) {
    return false;
  }

  if (
    p.op === 'replace' &&
    p.path.includes('/paidSkills') &&
    p.value % 10 !== 0
  ) {
    return false;
  }

  if (p.op === 'replace' && p.path.includes('/skills') && p.value % 10 !== 0) {
    return false;
  }

  if (p.op === 'replace' && p.path.includes('/agro')) return false;

  // ideally, it would not generate these patches, but we take what we can
  if (['/x', '/y', '/dir', '/corpseRef'].includes(p.path)) return false;
  if (p.path.includes('createdAt')) return false;
  if (p.path.includes('currentTick')) return false;
  if (p.path.includes('fov')) return false;
  if (p.path.includes('_')) return false;

  return true;
};

export const shouldSendPlayerPatch = (patch: Operation): boolean => {
  if (patch.path.includes('/npcs') && patch.path.includes('condition')) {
    return false;
  }

  if (
    (patch.op === 'replace' || patch.op === 'add') &&
    patch.path.includes('/ground') &&
    ['/searchItems', '/tansFor', '/corpseLevel', '/playersHeardDeath'].some(
      (p) => patch.path.includes(p),
    )
  ) {
    return false;
  }

  if (
    (patch.op === 'replace' || patch.op === 'add') &&
    patch.path.includes('/currentTick')
  ) {
    return false;
  }
  return true;
};

export const modifyPlayerPatch = (patch: Operation): Operation => {
  if (
    patch.op === 'add' &&
    patch.path.includes('/ground') &&
    Object.keys(patch.value).some((k) => patch.value[k].Corpse)
  ) {
    Object.keys(patch.value).forEach((key) => {
      if (!patch.value[key].Corpse) return;

      patch.value[key].Corpse.forEach((corpse) => {
        delete corpse.item.mods.tansFor;
        delete corpse.item.mods.corpseLevel;
        delete corpse.item.mods.playersHeardDeath;

        if (corpse.item.mods.searchItems.length > 0) {
          corpse.item.mods.searchItems = [1];
        }
      });
    });
  }

  return patch;
};
