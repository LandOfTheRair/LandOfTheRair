import type { Operation } from 'fast-json-patch';

export const shouldSendPatch = (patch: Operation): boolean => {
  if (patch.path.includes('/effects/_hash')) return true;

  // remove these patches since they're mostly superfluous
  if (
    patch.path === '/combatTicks' &&
    patch.op === 'replace' &&
    patch.value !== 0 &&
    patch.value !== 5
  ) {
    return false;
  }

  if (patch.op === 'replace' && patch.path.includes('/statistics')) {
    return false;
  }

  if (
    patch.op === 'replace' &&
    patch.path.includes('/npcs') &&
    patch.path.includes('/mp')
  ) {
    return false;
  }

  if (
    patch.op === 'replace' &&
    patch.path.includes('/allegianceReputation') &&
    ![-102, -101, -100, -99, -98, 98, 99, 100, 101, 102].includes(patch.value)
  ) {
    return false;
  }

  if (
    patch.op === 'replace' &&
    patch.path.includes('/condition') &&
    ![0, 1, 4999, 5000, 5001, 9999, 10000, 10001].includes(patch.value)
  ) {
    return false;
  }

  if (
    patch.op === 'replace' &&
    patch.path.includes('/paidSkills') &&
    patch.value % 10 !== 0
  ) {
    return false;
  }

  if (
    patch.op === 'replace' &&
    patch.path.includes('/skills') &&
    patch.value % 10 !== 0
  ) {
    return false;
  }

  if (patch.op === 'replace' && patch.path.includes('/effects/debuff')) {
    return false;
  }
  if (patch.op === 'replace' && patch.path.includes('/effects/buff')) {
    return false;
  }
  if (patch.op === 'replace' && patch.path.includes('/effects/outgoing')) {
    return false;
  }
  if (patch.op === 'replace' && patch.path.includes('/effects/incoming')) {
    return false;
  }

  if (patch.op === 'replace' && patch.path.includes('/agro')) return false;

  // ideally, it would not generate these patches, but we take what we can
  if (['/x', '/y', '/dir', '/corpseRef'].includes(patch.path)) return false;
  if (patch.path.includes('createdAt')) return false;
  if (patch.path.includes('currentTick')) return false;
  if (patch.path.includes('fov')) return false;
  if (patch.path.includes('_')) return false;

  return true;
};

export const shouldSendPlayerPatch = (patch: Operation): boolean => {
  if (patch.path.includes('/npcs') && patch.path.includes('condition')) {
    return false;
  }

  if (
    patch.op === 'replace' &&
    patch.path.includes('/ground') &&
    ['/searchItems'].some((p) => patch.path.includes(p))
  ) {
    return false;
  }

  if (
    (patch.op === 'replace' || patch.op === 'add' || patch.op === 'remove') &&
    patch.path.includes('/ground') &&
    ['/tansFor', '/corpseLevel', '/playersHeardDeath', '/expiresAt'].some((p) =>
      patch.path.includes(p),
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

  if (patch.op === 'replace' && patch.path.includes('/agro')) return false;

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

        if ((corpse.item.mods.searchItems?.length ?? 0) > 0) {
          corpse.item.mods.searchItems = [1];
        }
      });
    });
  }

  return patch;
};
