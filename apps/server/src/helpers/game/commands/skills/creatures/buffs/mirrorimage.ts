import { SpellCommand } from '@lotr/core';
import { hasEffect } from '@lotr/effects';
import type { ICharacter, IMacroCommandArgs, IPlayer } from '@lotr/interfaces';

export class MirrorImage extends SpellCommand {
  override aliases = ['cast mirrorimage'];
  override requiresLearn = true;
  override targetsFriendly = true;
  override canTargetSelf = true;
  override spellDataRef = 'MirrorImage';
  override spellRef = 'MirrorImage';

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return !hasEffect(target, 'MirrorImage');
  }

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    this.castSpellAt(player, player, args);
  }
}
