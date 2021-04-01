import { ICharacter, IStatusEffect, Skill, Stat } from '../../../../../interfaces';
import { Effect } from '../../../../../models';

export class Aid extends Effect {

  public create(char: ICharacter, effect: IStatusEffect) {
    const skill = this.game.characterHelper.getSkillLevel(char, Skill.Restoration) + 1;

    effect.effectInfo.statChanges = {
      [Stat.DEX]: Math.max(1, Math.floor(skill / 5)),
      [Stat.Offense]: skill
    };
  }

}
