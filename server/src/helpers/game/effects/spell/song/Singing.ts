import { ICharacter, IStatusEffect, Stat } from '../../../../../interfaces';
import { Effect } from '../../../../../models';

export class Singing extends Effect {

  override create(char: ICharacter, effect: IStatusEffect) {
    effect.effectInfo.statChanges = {
      [Stat.Defense]: this.game.traitHelper.traitLevelValue(char, 'DefensiveVoice'),
      [Stat.PhysicalResist]: this.game.traitHelper.traitLevelValue(char, 'ShieldingVoice'),
      [Stat.MagicalResist]: this.game.traitHelper.traitLevelValue(char, 'ShieldingVoice'),
      [Stat.SpellReflectChance]: this.game.traitHelper.traitLevelValue(char, 'ReflectingVoice')
    };
  }

}
