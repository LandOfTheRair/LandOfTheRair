import { SpellCommand } from '@lotr/core';
import { hasEffect } from '@lotr/effects';
import type { ICharacter, IMacroCommandArgs, IPlayer } from '@lotr/interfaces';

export class Song extends SpellCommand {
  override aliases = [''];
  override requiresLearn = true;
  override canTargetSelf = true;
  override targetsFriendly = true;
  override spellRef = 'Song';

  override range(): number {
    return 0;
  }

  override canUse(char: ICharacter): boolean {
    return !hasEffect(char, 'Song');
  }

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    this.castSpellAt(player, player, args);
  }

  override use(char: ICharacter) {
    this.castSpellAt(char, char);
  }
}
