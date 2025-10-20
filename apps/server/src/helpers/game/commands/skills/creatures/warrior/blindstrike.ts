import { sampleSize } from 'lodash';

import { isWeapon } from '@lotr/content';
import { SpellCommand, worldMapStateGetForCharacter } from '@lotr/core';
import type {
  ICharacter,
  IMacroCommandArgs,
  IPlayer,
  PhysicalAttackArgs,
} from '@lotr/interfaces';
import { ItemSlot } from '@lotr/interfaces';

export class Blindstrike extends SpellCommand {
  override aliases = ['blindstrike', 'art blindstrike'];
  override requiresLearn = true;

  override mpCost() {
    return 0;
  }

  override canCastSpell() {
    return true;
  }

  override range(char: ICharacter) {
    return this.calcPlainAttackRange(char);
  }

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    const weapon = player.items.equipment[ItemSlot.RightHand];
    if (!weapon) {
      return this.sendMessage(
        player,
        'You need a weapon in your hand to blindstrike!',
      );
    }

    if (!isWeapon(weapon)) {
      return this.sendMessage(
        player,
        'You need a weapon in your hand to blindstrike!',
      );
    }

    const range = this.range(player);
    if (range === -1) {
      return this.sendMessage(
        player,
        'You need to have your left hand empty to use that weapon!',
      );
    }

    this.use(player, player, { attackRange: 0 });
  }

  override use(
    user: ICharacter,
    target: ICharacter,
    opts: PhysicalAttackArgs = {},
  ): void {
    const state = worldMapStateGetForCharacter(user);
    if (!state) return;

    const numTargets = 1;
    const targets = state.getAllInRangeWithoutVisibilityTo(user, 0, [
      user.uuid,
    ]);
    const foundTargets = sampleSize(targets, numTargets);

    if (foundTargets.length === 0) {
      this.sendMessage(user, 'You swing your weapon wildly, hitting no one!');
      return;
    }

    foundTargets.forEach((chosenTarget) => {
      this.game.combatHelper.physicalAttack(user, chosenTarget, {
        ...opts,
        damageMult: 0.75,
      });
    });
  }
}
