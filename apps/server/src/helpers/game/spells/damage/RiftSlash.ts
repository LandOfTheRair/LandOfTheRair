import { isPlayer } from '@lotr/characters';
import { transmissionMovementPatchSend } from '@lotr/core';
import type { ICharacter, SpellCastArgs } from '@lotr/interfaces';
import type { Player } from '../../../../models';
import { Spell } from '../../../../models/world/Spell';

export class RiftSlash extends Spell {
  override cast(
    caster: ICharacter | undefined,
    target: ICharacter | undefined,
    spellCastArgs: SpellCastArgs,
  ): void {
    if (!caster || !target) return;

    this.game.teleportHelper.setCharXY(caster, target.x, target.y);
    if (isPlayer(caster)) {
      this.game.playerHelper.resetStatus(caster as Player, { sendFOV: false });
      transmissionMovementPatchSend(caster as Player);
    }

    this.game.combatHelper.physicalAttack(caster, target);
  }
}
