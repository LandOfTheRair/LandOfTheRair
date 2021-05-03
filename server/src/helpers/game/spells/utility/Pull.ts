
import { ICharacter, SpellCastArgs } from '../../../../interfaces';
import { Player } from '../../../../models';
import { Spell } from '../../../../models/world/Spell';

export class Pull extends Spell {

  override cast(caster: ICharacter | null, target: ICharacter | null, spellCastArgs: SpellCastArgs): void {
    if (!caster || !target) return;

    this.game.teleportHelper.setCharXY(target, caster.x, caster.y);

    if (this.game.characterHelper.isPlayer(target)) {
      this.game.playerHelper.resetStatus(target as Player, { sendFOV: false });
      this.game.transmissionHelper.sendMovementPatch(target as Player);
    }

    this.sendMessage(target, { message: `${caster.name} pulls you closer!` });
  }

}
