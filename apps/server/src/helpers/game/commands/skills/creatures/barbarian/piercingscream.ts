import { hasEffect } from '@lotr/effects';
import type { ICharacter, IMacroCommandArgs, IPlayer } from '@lotr/interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class PiercingScream extends SpellCommand {
  override aliases = ['art piercingscream'];
  override requiresLearn = true;
  override targetsFriendly = false;
  override canTargetSelf = false;
  override spellDataRef = 'PiercingScream';
  override spellRef = 'PiercingScream';

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return super.canUse(caster, target) && !hasEffect(target, 'PiercingScream');
  }

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    this.castSpellAt(player, player, args);
  }

  override use(char: ICharacter) {
    this.castSpellAt(char, char);
  }
}
