import { isPlayer } from '@lotr/characters';
import { settingClassConfigGet, traitLevelValue } from '@lotr/content';
import type { ICharacter, IPlayer, IStatusEffect } from '@lotr/interfaces';
import { Skill, Stat } from '@lotr/interfaces';
import { Effect } from '../../../../../models';

export class Singing extends Effect {
  override create(char: ICharacter, effect: IStatusEffect) {
    effect.effectInfo.statChanges = {
      [Stat.Defense]: traitLevelValue(char, 'DefensiveVoice'),
      [Stat.PhysicalResist]: traitLevelValue(char, 'ShieldingVoice'),
      [Stat.MagicalResist]: traitLevelValue(char, 'ShieldingVoice'),
      [Stat.SpellReflectChance]: traitLevelValue(char, 'ReflectingVoice'),
    };
  }

  override tick(char: ICharacter) {
    const gainsSkillFromSinging =
      settingClassConfigGet<'gainsSkillFromSinging'>(
        char.baseClass,
        'gainsSkillFromSinging',
      );

    // thieves have to use their stealth bar
    if (gainsSkillFromSinging) {
      if (isPlayer(char)) {
        this.game.playerHelper.tryGainSkill(char as IPlayer, Skill.Thievery, 1);
      }
    }
  }
}
