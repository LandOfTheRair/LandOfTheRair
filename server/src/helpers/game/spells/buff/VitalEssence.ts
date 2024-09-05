import { ICharacter, Stat } from '../../../../interfaces';
import { Spell } from '../../../../models/world/Spell';

export class VitalEssence extends Spell {
  override getCharges(caster: ICharacter | null) {
    return caster
      ? this.game.characterHelper.getStat(caster, Stat.WIS) * 100
      : 10;
  }
}
