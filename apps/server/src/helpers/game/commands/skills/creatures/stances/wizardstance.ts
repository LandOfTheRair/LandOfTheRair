import { SpellCommand } from '@lotr/core';
import { hasEffect } from '@lotr/effects';
import type { ICharacter, IMacroCommandArgs, IPlayer } from '@lotr/interfaces';

export class WizardStance extends SpellCommand {
  override aliases = ['wizardstance', 'cast wizardstance'];
  override requiresLearn = true;
  override targetsFriendly = true;
  override canTargetSelf = true;
  override spellRef = 'WizardStance';

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return super.canUse(caster, target) && !caster.effects.incoming.length;
  }

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    if (hasEffect(player, 'WizardStance')) {
      this.game.effectHelper.removeEffectByName(player, 'WizardStance');
      this.sendMessage(player, 'You return to a normal stance.');
      return;
    }

    this.castSpellAt(player, player, args);
  }

  override use(char: ICharacter) {
    this.castSpellAt(char, char);
  }
}
