import { ICharacter, Stat } from '../../../../interfaces';
import { Spell } from '../../../../models/world/Spell';

export class Shield extends Spell {
  override getPotency(caster: ICharacter | null) {
    return caster
      ? this.game.characterHelper.getStat(caster, Stat.STR) * 10
      : 150;
  }
}
