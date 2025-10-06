import type { ICharacter, SpellCastArgs } from '@lotr/interfaces';
import type { Player } from '../../../../models';
import { Spell } from '../../../../models/world/Spell';

export class RiftSlash extends Spell {
  override cast(
    caster: ICharacter | null,
    target: ICharacter | null,
    spellCastArgs: SpellCastArgs,
  ): void {
    if (!caster || !target) return;

    this.game.teleportHelper.setCharXY(caster, target.x, target.y);
    if (this.game.characterHelper.isPlayer(caster)) {
      this.game.playerHelper.resetStatus(caster as Player, { sendFOV: false });
      this.game.transmissionHelper.sendMovementPatch(caster as Player);
    }

    this.game.combatHelper.physicalAttack(caster, target);
  }
}
