import { ICharacter, IStatusEffect, Stat } from '../../../../../interfaces';
import { Effect } from '../../../../../models';

export class BarNecro extends Effect {
  public override create(char: ICharacter, effect: IStatusEffect) {
    let boost = 1;

    if (effect.sourceUUID) {
      const mapState = this.game.worldManager.getMap(char.map)?.state;
      const caster = mapState?.getCharacterByUUID(effect.sourceUUID);

      if (caster) {
        boost += this.game.traitHelper.traitLevelValue(caster, 'NecroticWard');
      }
    }

    effect.effectInfo.potency = Math.floor(boost * effect.effectInfo.potency);

    effect.effectInfo.statChanges = {
      [Stat.NecroticResist]: effect.effectInfo.potency,
      [Stat.PoisonResist]: Math.floor(effect.effectInfo.potency / 5),
      [Stat.DiseaseResist]: Math.floor(effect.effectInfo.potency / 10),
    };
  }
}
