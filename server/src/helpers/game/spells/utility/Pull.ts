
import { ICharacter, SpellCastArgs } from '../../../../interfaces';
import { Spell } from '../../../../models/world/Spell';

export class Pull extends Spell {

  override cast(caster: ICharacter | null, target: ICharacter | null, spellCastArgs: SpellCastArgs): void {
    if (!caster || !target) return;

    this.game.teleportHelper.setCharXY(target, caster.x, caster.y);

    this.sendMessage(target, { message: `${caster.name} pulls you closer!` });
  }

}
