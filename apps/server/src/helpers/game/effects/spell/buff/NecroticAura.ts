import type { ICharacter, IStatusEffect } from '@lotr/interfaces';
import { DamageClass } from '@lotr/interfaces';
import { Effect } from '../../../../../models';

export class NecroticAura extends Effect {
  public override tick(char: ICharacter, effect: IStatusEffect) {
    super.tick(char, effect);

    if (effect.effectInfo.potency <= 0) return;

    const state = this.game.worldManager.getMapStateForCharacter(char);
    if (!state) return;

    const nearby = state.getAllHostilesInRange(char, 1);
    nearby.forEach((target) => {
      this.game.damageHelperMagic.magicalAttack(char, target, {
        atkMsg: 'Your aura of death damages %0!',
        defMsg: "%0's aura of death damages you!",
        damage: effect.effectInfo.potency,
        damageClass: DamageClass.Necrotic,
      });
    });
  }
}
