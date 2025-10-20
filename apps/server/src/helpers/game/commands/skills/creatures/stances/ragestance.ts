import { SpellCommand } from '@lotr/core';
import type { ICharacter, IMacroCommandArgs, IPlayer } from '@lotr/interfaces';
import { ItemSlot } from '@lotr/interfaces';

import { hasEffect } from '@lotr/effects';
export class RageStance extends SpellCommand {
  override aliases = ['ragestance', 'art ragestance'];
  override requiresLearn = true;
  override targetsFriendly = true;
  override canTargetSelf = true;
  override spellRef = 'RageStance';

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return (
      super.canUse(caster, target) &&
      !caster.effects.outgoing.length &&
      !hasEffect(caster, 'ParryStance') &&
      !!caster.items.equipment[ItemSlot.RightHand]
    );
  }

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    if (hasEffect(player, 'RageStance')) {
      this.game.effectHelper.removeEffectByName(player, 'RageStance');
      this.sendMessage(player, 'You return to a normal stance.');
      return;
    }

    if (!player.items.equipment[ItemSlot.RightHand]) {
      return this.sendMessage(
        player,
        'You need a weapon in your hands to take a stance!',
      );
    }

    this.castSpellAt(player, player, args);
  }

  override use(char: ICharacter) {
    this.castSpellAt(char, char);
  }
}
