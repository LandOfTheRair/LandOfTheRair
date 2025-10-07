import { isPlayer } from '@lotr/characters';
import type { ICharacter, IPlayer, IStatusEffect } from '@lotr/interfaces';
import { Skill, Stat } from '@lotr/interfaces';
import { Effect } from '../../../../../models';

export class Singing extends Effect {
  override create(char: ICharacter, effect: IStatusEffect) {
    effect.effectInfo.statChanges = {
      [Stat.Defense]: this.game.traitHelper.traitLevelValue(
        char,
        'DefensiveVoice',
      ),
      [Stat.PhysicalResist]: this.game.traitHelper.traitLevelValue(
        char,
        'ShieldingVoice',
      ),
      [Stat.MagicalResist]: this.game.traitHelper.traitLevelValue(
        char,
        'ShieldingVoice',
      ),
      [Stat.SpellReflectChance]: this.game.traitHelper.traitLevelValue(
        char,
        'ReflectingVoice',
      ),
    };
  }

  override tick(char: ICharacter) {
    const gainsSkillFromSinging =
      this.game.contentManager.getClassConfigSetting<'gainsSkillFromSinging'>(
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
