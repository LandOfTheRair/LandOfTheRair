import { hasEffect } from '@lotr/effects';
import type { ICharacter, IMacroCommandArgs, IPlayer } from '@lotr/interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class Serenity extends SpellCommand {
  override aliases = ['cast serenity'];
  override requiresLearn = true;
  override targetsFriendly = true;
  override canTargetSelf = true;
  override spellDataRef = 'Serenity';
  override spellRef = 'Serenity';

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return !hasEffect(target, 'Serenity');
  }

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    this.castSpellAt(player, player, args);
  }
}
