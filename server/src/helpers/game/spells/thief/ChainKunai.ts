import { ICharacter, SpellCastArgs } from '../../../../interfaces';
import { Spell } from '../../../../models/world/Spell';

export class ChainKunai extends Spell {

  override getDuration(): number {
    return 5;
  }

  override cast(caster: ICharacter | null, target: ICharacter | null, spellCastArgs: SpellCastArgs): void {
    if (caster && target && !this.game.effectHelper.hasEffect(target, 'Unshakeable')) {
      this.game.teleportHelper.setCharXY(target, caster.x, caster.y);
    }
  }

}
