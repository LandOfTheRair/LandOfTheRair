import { SpellCommand } from '@lotr/core';
import { hasEffect } from '@lotr/effects';
import type { ICharacter, IMacroCommandArgs, IPlayer } from '@lotr/interfaces';
import { ItemSlot } from '@lotr/interfaces';

export class ParryStance extends SpellCommand {
  override aliases = ['parrystance', 'art parrystance'];
  override requiresLearn = true;
  override targetsFriendly = true;
  override canTargetSelf = true;
  override spellRef = 'ParryStance';

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return (
      super.canUse(caster, target) &&
      !caster.effects.incoming.length &&
      !hasEffect(caster, 'RageStance') &&
      !!caster.items.equipment[ItemSlot.RightHand]
    );
  }

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    if (hasEffect(player, 'ParryStance')) {
      this.game.effectHelper.removeEffectByName(player, 'ParryStance');
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
