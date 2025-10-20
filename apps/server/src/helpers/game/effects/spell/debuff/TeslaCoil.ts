import { worldGetMapAndState } from '@lotr/core';
import type { ICharacter, IStatusEffect } from '@lotr/interfaces';
import { DamageClass } from '@lotr/interfaces';
import { Effect } from '../../../../../models';

export class TeslaCoil extends Effect {
  override tick(char: ICharacter, effect: IStatusEffect) {
    super.tick(char, effect);

    let caster: ICharacter | undefined;
    if (effect.sourceUUID) {
      const mapState = worldGetMapAndState(char.map)?.state;
      caster = mapState?.getCharacterByUUID(effect.sourceUUID);
    }

    const nearby = this.game.targettingHelper
      .getPossibleAOETargets(caster, char, 4, 8)
      .filter((x) => x !== caster && x !== char);

    nearby.forEach((target) => {
      this.game.combatHelper.magicalAttack(char, target, {
        damage: effect.effectInfo.potency,
        damageClass: DamageClass.Lightning,
        defMsg: 'Raw electricity courses through your body!',
      });
    });
  }
}
