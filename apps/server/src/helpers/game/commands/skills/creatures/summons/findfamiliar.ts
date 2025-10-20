import { SpellCommand } from '@lotr/core';
import { hasEffect } from '@lotr/effects';
import type { ICharacter, IMacroCommandArgs, IPlayer } from '@lotr/interfaces';

export class FindFamiliar extends SpellCommand {
  override aliases = [''];
  override requiresLearn = true;
  override targetsFriendly = true;
  override spellRef = 'FindFamiliar';

  override range(): number {
    return 0;
  }

  override canUse(char: ICharacter): boolean {
    return !hasEffect(char, 'FindFamiliar') && !char.spellChannel;
  }

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    this.game.effectHelper.removeEffectByName(player, 'FindFamiliar');
    this.castSpellAt(player, player, args);
  }

  override use(char: ICharacter) {
    this.castSpellAt(char, char);
  }
}
