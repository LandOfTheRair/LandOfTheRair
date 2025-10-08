import { heal } from '@lotr/characters';
import { traitLevelValue } from '@lotr/content';
import type { ICharacter, IStatusEffect } from '@lotr/interfaces';
import { Effect } from '../../../../models';

export class ExactHeal extends Effect {
  override apply(char: ICharacter, effect: IStatusEffect) {
    const bonus =
      traitLevelValue(char, 'EffectivePotions') +
      traitLevelValue(char, 'AncientPotions');
    heal(char, effect.effectInfo.potency + bonus);
    this.sendMessage(char, { message: "You've been healed." });
  }
}
