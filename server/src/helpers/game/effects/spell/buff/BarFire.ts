import { ICharacter, IStatusEffect, Stat } from '../../../../../interfaces';
import { Effect } from '../../../../../models';

export class BarFire extends Effect {
  public override create(char: ICharacter, effect: IStatusEffect) {
    let boost = 1;

    if (effect.sourceUUID) {
      const mapState = this.game.worldManager.getMap(char.map)?.state;
      const caster = mapState?.getCharacterByUUID(effect.sourceUUID);

      if (caster) {
        boost += this.game.traitHelper.traitLevelValue(
          caster,
          'ThermalBarrier',
        );
      }
    }

    effect.effectInfo.potency = Math.floor(boost * effect.effectInfo.potency);
    effect.effectInfo.statChanges = {
      [Stat.FireResist]: effect.effectInfo.potency,
    };
  }
}
