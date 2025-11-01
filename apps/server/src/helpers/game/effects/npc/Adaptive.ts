import { itemPropertiesGet } from '@lotr/content';
import type { DamageArgs, ICharacter, IStatusEffect } from '@lotr/interfaces';
import { DamageClass, ItemClass, SharpWeaponClasses } from '@lotr/interfaces';
import { Effect } from '../../../../models';

const ResistPercent = 5;
const ResistDropPercent = ResistPercent * 5;

const DamageOpposites: Partial<Record<DamageClass, DamageClass[]>> = {
  [DamageClass.Fire]: [DamageClass.Ice],
  [DamageClass.Ice]: [DamageClass.Fire],
  [DamageClass.Lightning]: [DamageClass.Acid],
  [DamageClass.Acid]: [DamageClass.Lightning],
  [DamageClass.Poison]: [DamageClass.Disease],
  [DamageClass.Disease]: [DamageClass.Poison],
  [DamageClass.Sharp]: [DamageClass.Blunt],
  [DamageClass.Blunt]: [DamageClass.Sharp],
  [DamageClass.Energy]: [DamageClass.Sonic],
  [DamageClass.Sonic]: [DamageClass.Energy],
};

export class Adaptive extends Effect {
  public override incoming(
    effect: IStatusEffect,
    char: ICharacter,
    attacker: ICharacter | undefined,
    damageArgs: DamageArgs,
    currentDamage: number,
  ): number {
    if (currentDamage < 0 || !attacker) return currentDamage;

    const { damageClass, attackerWeapon, damage } = damageArgs;

    let checkedDamageClass = damageClass;

    if (damageClass === DamageClass.Physical) {
      // we check against the weapon if we can
      if (attackerWeapon) {
        const { itemClass } = itemPropertiesGet(attackerWeapon, ['itemClass']);
        if (!SharpWeaponClasses[itemClass ?? ItemClass.Hands]) {
          checkedDamageClass = DamageClass.Blunt;
        }

        if (SharpWeaponClasses[itemClass ?? ItemClass.Hands]) {
          checkedDamageClass = DamageClass.Sharp;
        }

        // if not, we're using hands, we only care to check blunt resist in this case
      } else {
        checkedDamageClass = DamageClass.Blunt;
      }
    }

    const opposite = DamageOpposites[checkedDamageClass];

    if (!opposite) return currentDamage;

    effect.effectInfo.statChanges ??= {};
    effect.effectInfo.statChanges[`_${checkedDamageClass}Resist`] =
      effect.effectInfo.statChanges[`_${checkedDamageClass}Resist`] ??= 0;
    effect.effectInfo.statChanges[`_${opposite}Resist`] =
      effect.effectInfo.statChanges[`_${opposite}Resist`] ?? 0;

    effect.effectInfo.statChanges[`_${checkedDamageClass}Resist`] += Math.floor(
      (damage * ResistPercent) / 100,
    );

    effect.effectInfo.statChanges[`_${opposite}Resist`] -= Math.floor(
      (damage * ResistDropPercent) / 100,
    );

    effect.effectInfo.statChanges[`_${opposite}Resist`] = Math.max(
      effect.effectInfo.statChanges[`_${opposite}Resist`] ?? 0,
      0,
    );

    const tooltip = Object.keys(effect.effectInfo.statChanges)
      .filter((stat) => effect.effectInfo.statChanges![stat] > 0)
      .map(
        (stat) =>
          `${stat.replace('_', '').replace('Resist', '')} (${effect.effectInfo.statChanges![stat]})`,
      )
      .join(', ');

    effect.effectInfo.tooltip = `Resisting: ${tooltip}`;

    return Math.max(
      0,
      currentDamage -
        effect.effectInfo.statChanges[`_${checkedDamageClass}Resist`],
    );
  }
}
