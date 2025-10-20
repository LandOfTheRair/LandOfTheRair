import { SpellCommand } from '@lotr/core';
import type { ICharacter, IMacroCommandArgs, IPlayer } from '@lotr/interfaces';

export class ConjureHealing extends SpellCommand {
  override aliases = ['conjurehealing', 'cast conjurehealing'];
  override requiresLearn = true;
  override spellRef = 'ConjureHealing';
  override canTargetSelf = true;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    this.castSpellAt(player, player, args);
  }

  override use(char: ICharacter) {
    this.castSpellAt(char, char);
  }
}
