import { ICharacter, Stat } from '../../../../interfaces';
import { Spell } from '../../../../models/world/Spell';

export class Daze extends Spell {
  override getDuration(caster: ICharacter | null) {
    if (!caster) return 15;
    return (
      Math.floor(this.game.characterHelper.getStat(caster, Stat.WIS) * 2) +
      this.game.traitHelper.traitLevelValue(caster, 'DazingOutlook')
    );
  }

  override getPotency(caster: ICharacter | null) {
    if (!caster) return 10;
    return (
      Math.floor(this.game.characterHelper.getStat(caster, Stat.WIS) * 2) +
      this.game.traitHelper.traitLevelValue(caster, 'DazingOutlook')
    );
  }
}
