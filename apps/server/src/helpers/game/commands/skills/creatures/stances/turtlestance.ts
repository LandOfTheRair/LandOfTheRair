import { isUtilizingMartialWeapon } from '@lotr/characters';
import { traitHasLearned } from '@lotr/content';
import { SpellCommand } from '@lotr/core';
import { hasEffect } from '@lotr/effects';
import type { ICharacter, IMacroCommandArgs, IPlayer } from '@lotr/interfaces';
import { ItemSlot } from '@lotr/interfaces';

export class TurtleStance extends SpellCommand {
  override aliases = ['turtlestance', 'art turtlestance'];
  override requiresLearn = true;
  override targetsFriendly = true;
  override canTargetSelf = true;
  override spellRef = 'TurtleStance';

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    const weapon = caster.items.equipment[ItemSlot.RightHand];
    const canUseMartialWeapon =
      traitHasLearned(caster, 'MartialWeapons') &&
      isUtilizingMartialWeapon(caster);

    return (
      super.canUse(caster, target) &&
      !caster.effects.incoming.length &&
      (!weapon || canUseMartialWeapon)
    );
  }

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    if (hasEffect(player, 'TurtleStance')) {
      this.game.effectHelper.removeEffectByName(player, 'TurtleStance');
      this.sendMessage(player, 'You return to a normal stance.');
      return;
    }

    const weapon = player.items.equipment[ItemSlot.RightHand];
    const canUseMartialWeapon =
      traitHasLearned(player, 'MartialWeapons') &&
      isUtilizingMartialWeapon(player);

    if (weapon && !canUseMartialWeapon) {
      return this.sendMessage(
        player,
        'You cannot take a stance with that in your right hand!',
      );
    }

    this.castSpellAt(player, player, args);
  }

  override use(char: ICharacter) {
    this.castSpellAt(char, char);
  }
}
