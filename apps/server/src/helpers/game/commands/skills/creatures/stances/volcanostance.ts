import { SpellCommand } from '@lotr/core';
import { hasEffect } from '@lotr/effects';
import type { ICharacter, IMacroCommandArgs, IPlayer } from '@lotr/interfaces';

export class VolcanoStance extends SpellCommand {
  override aliases = ['volcanostance', 'cast volcanostance'];
  override requiresLearn = true;
  override targetsFriendly = true;
  override canTargetSelf = true;
  override spellRef = 'VolcanoStance';

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return super.canUse(caster, target) && !caster.effects.outgoing.length;
  }

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    if (hasEffect(player, 'VolcanoStance')) {
      this.game.effectHelper.removeEffectByName(player, 'VolcanoStance');
      this.sendMessage(player, 'You return to a normal stance.');
      return;
    }

    this.castSpellAt(player, player, args);
  }

  override use(char: ICharacter) {
    this.castSpellAt(char, char);
  }
}
