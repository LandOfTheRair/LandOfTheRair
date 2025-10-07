import { mana } from '@lotr/characters';
import { settingClassConfigGet } from '@lotr/content';
import type { ICharacter, IStatusEffect } from '@lotr/interfaces';
import { Effect } from '../../../../models';

export class ExactHealMP extends Effect {
  override apply(char: ICharacter, effect: IStatusEffect) {
    const usesMana = settingClassConfigGet<'usesMana'>(
      char.baseClass,
      'usesMana',
    );

    if (!usesMana) {
      this.sendMessage(char, { message: 'This tastes like slime mold juice.' });
      return;
    }

    mana(char, effect.effectInfo.potency);
    this.sendMessage(char, { message: 'You feel a rush of magic energy.' });
  }
}
