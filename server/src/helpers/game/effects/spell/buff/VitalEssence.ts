
import { ICharacter, IStatusEffect, Stat, Skill } from '../../../../../interfaces';
import { Effect } from '../../../../../models';

export class VitalEssence extends Effect {

  public create(char: ICharacter, effect: IStatusEffect) {
    const skill = this.game.characterHelper.getSkillLevel(char, Skill.Restoration) + 1;

    effect.effectInfo.statChanges = {
      [Stat.HP]: effect.effectInfo.potency,
      [Stat.ArmorClass]: skill
    };

    effect.effectInfo.tooltip = `Increase HP by ${effect.effectInfo.potency} and AC by ${skill}.`;
  }

}
