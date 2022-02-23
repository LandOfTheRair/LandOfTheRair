import { DamageArgs, DamageClass, ICharacter, IStatusEffect, Skill, Stat } from '../../../../../interfaces';
import { Effect } from '../../../../../models';

export class VolcanoStance extends Effect {

  public override create(char: ICharacter, effect: IStatusEffect) {

    this.game.messageHelper.sendLogMessageToRadius(char, 4, { message: `${char.name} takes on an explosive stance.` });

    const skill = this.game.characterHelper.getSkillLevel(char, Skill.Conjuration) + 1;

    effect.effectInfo.statChanges = {
      [Stat.Offense]: skill,
      [Stat.Accuracy]: skill,
      [Stat.ArmorClass]: -skill,
      [Stat.Defense]: -skill,
      [Stat.FireBoostPercent]: skill
    };
  }

  public override outgoing(
    effect: IStatusEffect,
    char: ICharacter,
    target: ICharacter,
    damageArgs: DamageArgs
  ): void {
    if (damageArgs.damageClass !== DamageClass.Physical) return;

    if (this.game.effectHelper.hasEffect(char, 'ImbueFlame') && this.game.characterHelper.hasLearned(char, 'Combust')) {
      this.game.commandHandler.getSkillRef('Combust').use(char, target);

    } else {
      this.game.damageHelperMagic.magicalAttack(char, target, {
        atkMsg: 'You unleash volcanic fury on %0!',
        defMsg: '%0 hit you with a burst of volcanic heat!',
        damage: effect.effectInfo.potency,
        damageClass: DamageClass.Fire
      });

    }
  }

}
