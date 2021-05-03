
import { DamageClass, ICharacter, IStatusEffect } from '../../../../../interfaces';
import { Effect } from '../../../../../models';

export class NecroticAura extends Effect {

  public override tick(char: ICharacter, effect: IStatusEffect) {
    super.tick(char, effect);

    if (effect.effectInfo.potency <= 0) return;

    this.game.targettingHelper.getPossibleAOETargets(char, char, 1).forEach(target => {

      this.game.damageHelperMagic.magicalAttack(char, target, {
        atkMsg: 'Your aura of death damages %0!',
        defMsg: '%0\'s aura of death damages you!',
        damage: effect.effectInfo.potency,
        damageClass: DamageClass.Necrotic
      });
    });
  }

}
