import type { ICharacter, IStatusEffect } from '@lotr/interfaces';
import { DamageClass } from '@lotr/interfaces';
import { Effect } from '../../../../../models';

export class TeslaCoil extends Effect {
  override tick(char: ICharacter, effect: IStatusEffect) {
    super.tick(char, effect);

    let caster: ICharacter | null = null;
    if (effect.sourceUUID) {
      const mapState = this.game.worldManager.getMap(char.map)?.state;
      caster = mapState?.getCharacterByUUID(effect.sourceUUID) ?? null;
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
