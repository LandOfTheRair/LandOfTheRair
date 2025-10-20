import { SpellCommand } from '@lotr/core';
import type { ICharacter, IMacroCommandArgs, IPlayer } from '@lotr/interfaces';

export class FerociousRoar extends SpellCommand {
  override aliases = ['art ferociousroar'];
  override requiresLearn = true;
  override targetsFriendly = false;
  override canTargetSelf = false;
  override spellDataRef = 'FerociousRoar';
  override spellRef = 'FerociousRoar';

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return false;
  }

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    this.castSpellAt(player, player, args);
  }

  override use(char: ICharacter) {
    this.castSpellAt(char, char);
  }
}
