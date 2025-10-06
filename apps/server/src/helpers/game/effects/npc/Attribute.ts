import { capitalize } from 'lodash';

import { hasEffect } from '@lotr/effects';
import type {
  DamageArgs,
  ICharacter,
  INPC,
  IStatusEffect,
} from '@lotr/interfaces';
import {
  ItemClass,
  MagicClasses,
  MonsterClass,
  SharpWeaponClasses,
} from '@lotr/interfaces';
import { Effect } from '../../../../models';

type AttributeType =
  // base types
  | 'physical'
  | 'blunt'
  | 'sharp'
  | 'magical'
  | 'necrotic'
  | 'fire'
  | 'lightning'
  | 'ice'
  | 'water'
  | 'energy'
  | 'poison'
  | 'disease'
  | 'sonic'

  // special types
  | 'turkey';

const ResistanceShredders = {
  [MonsterClass.Undead]: 'EtherFire',
  [MonsterClass.Beast]: 'BeastRipper',
  [MonsterClass.Dragon]: 'ScaleShredder',
};

export class Attribute extends Effect {
  public override formatEffectName(
    char: ICharacter,
    effect: IStatusEffect,
  ): string {
    return effect.effectInfo.damageType + effect.effectName;
  }

  public override apply(char: ICharacter, effect: IStatusEffect) {
    const effInfo = effect.effectInfo;

    const damageType: AttributeType =
      effInfo.damageType ?? ('physical' as AttributeType);

    effInfo.potency = effInfo.potency ?? 1;

    const message = `${capitalize(damageType)} damage is ${Math.floor(effInfo.potency * 100)}% effective.`;
    effInfo.effectIcon = effInfo.potency < 1 ? 'edged-shield' : 'gooey-impact';
    effInfo.tooltip = message;
    effInfo.tooltipColor = this.determineColor(
      effInfo.damageType ?? 'physical',
    );

    if (effInfo.potency <= 0) effInfo.potency = 0;
    if (effInfo.potency === 0) {
      effInfo.tooltip = `Immune to ${capitalize(damageType)} damage.`;
    }

    if (damageType === 'turkey') {
      effInfo.effectIcon = 'bird-twitter';
      effInfo.tooltip =
        'Immune to all damage, except from blunderbuss-type weapons.';
      effInfo.unableToShred = true;
    }

    if (effInfo.unableToShred) {
      effInfo.tooltip = `${effInfo.tooltip} Not bypassable.`;
    }
  }

  public override incoming(
    effect: IStatusEffect,
    char: ICharacter,
    attacker: ICharacter | null,
    damageArgs: DamageArgs,
    currentDamage: number,
  ): number {
    const effInfo = effect.effectInfo;
    const damageType = effect.effectInfo.damageType as AttributeType;

    const monsterClass = (char as INPC).monsterClass;

    const { damageClass, attackerWeapon } = damageArgs;

    // special handling for turkeys because why not
    if (damageType === 'turkey') {
      if (attackerWeapon) {
        const { itemClass } = this.game.itemHelper.getItemProperties(
          attackerWeapon,
          ['itemClass'],
        );

        if (itemClass === ItemClass.Blunderbuss) return currentDamage;
      }

      return 0;
    }

    // if we have an attacker, monsterclass, we can shred this attribute, one exists, the attacker has it, and we reduce damage, then we let it go through exactly
    if (
      attacker &&
      monsterClass &&
      !effect.effectInfo.unableToShred &&
      ResistanceShredders[monsterClass] &&
      hasEffect(attacker, ResistanceShredders[monsterClass]) &&
      effect.effectInfo.potency < 1
    ) {
      return currentDamage;
    }

    // if the attribute matches the damage type, we lower it
    if (damageClass === effInfo.damageType) {
      return Math.floor(currentDamage * effInfo.potency);
    }

    // if the damage was physical, we check if we're blunt or sharp
    if (damageClass === 'physical') {
      // we check against the weapon if we can
      if (attackerWeapon) {
        const { itemClass } = this.game.itemHelper.getItemProperties(
          attackerWeapon,
          ['itemClass'],
        );
        if (
          damageType === 'blunt' &&
          !SharpWeaponClasses[itemClass ?? ItemClass.Hands]
        ) {
          return Math.floor(currentDamage * effInfo.potency);
        }
        if (
          damageType === 'sharp' &&
          SharpWeaponClasses[itemClass ?? ItemClass.Hands]
        ) {
          return Math.floor(currentDamage * effInfo.potency);
        }

        // if not, we're using hands, we only care to check blunt resist in this case
      } else {
        if (damageType === 'blunt') {
          return Math.floor(currentDamage * effInfo.potency);
        }
      }
    }

    if (damageType === 'magical' && MagicClasses[damageClass]) {
      return Math.floor(currentDamage * effInfo.potency);
    }

    return currentDamage;
  }

  private determineColor(attr: AttributeType) {
    switch (attr) {
      case 'physical':
        return '#000';
      case 'sharp':
        return '#000';
      case 'blunt':
        return '#000';
      case 'turkey':
        return '#000';

      case 'magical':
        return '#f0f';
      case 'necrotic':
        return '#0a0';
      case 'fire':
        return '#dc143c';
      case 'lightning':
        return '#ffd700';
      case 'ice':
        return '#000080';
      case 'water':
        return '#1a1aff';
      case 'energy':
        return '#f0f';

      default:
        return '#000';
    }
  }
}
