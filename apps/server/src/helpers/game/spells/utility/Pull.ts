import { isPlayer } from '@lotr/characters';
import { transmissionMovementPatchSend } from '@lotr/core';
import type { ICharacter, SpellCastArgs } from '@lotr/interfaces';
import type { Player } from '../../../../models';
import { Spell } from '../../../../models/world/Spell';

export class Pull extends Spell {
  override cast(
    caster: ICharacter | undefined,
    target: ICharacter | undefined,
    spellCastArgs: SpellCastArgs,
  ): void {
    if (!caster || !target) return;

    this.game.teleportHelper.setCharXY(target, caster.x, caster.y);

    if (isPlayer(target)) {
      this.game.playerHelper.resetStatus(target as Player, { sendFOV: false });
      transmissionMovementPatchSend(target as Player);
    }

    this.sendMessage(target, { message: `${caster.name} pulls you closer!` });
  }
}
