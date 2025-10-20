import { itemPropertyGet } from '@lotr/content';
import { SkillCommand } from '@lotr/core';
import { getEffect } from '@lotr/effects';
import type {
  ICharacter,
  IMacroCommandArgs,
  IPlayer,
  PhysicalAttackArgs,
} from '@lotr/interfaces';
import { ItemSlot } from '@lotr/interfaces';
import { distanceFrom } from '@lotr/shared';

export class AttackCommand extends SkillCommand {
  override aliases = ['a', 'attack'];

  override range(char: ICharacter) {
    return this.calcPlainAttackRange(char);
  }

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    if (!args.stringArgs) return false;

    const isBerserked = getEffect(player, 'Berserk');
    if (isBerserked) return;

    const range = this.range(player);
    if (range === -1) {
      return this.sendMessage(
        player,
        'You need to have your left hand empty to use that weapon!',
      );
    }

    const target = this.game.targettingHelper.getFirstPossibleTargetInViewRange(
      player,
      args.stringArgs,
    );
    if (!target) return this.youDontSeeThatPerson(player, args.stringArgs);

    if (target === player) return;

    if (distanceFrom(player, target) > range) {
      return this.sendMessage(player, 'That target is too far away!');
    }

    this.use(player, target, { attackRange: range });
  }

  override use(
    user: ICharacter,
    target: ICharacter,
    opts: PhysicalAttackArgs = {},
  ): void {
    this.tryToEquipAmmoForBow(user);

    opts.attackRange = this.range(user);
    this.game.combatHelper.physicalAttack(user, target, opts);

    // bouncing arrows
    if (opts.attackRange > 1 && user && target) {
      this.game.combatHelper.attemptArrowBounce(user, target, opts);
    }
  }

  private tryToEquipAmmoForBow(user: ICharacter) {
    const weapon = user.items.equipment[ItemSlot.RightHand];
    if (!itemPropertyGet(weapon, 'canShoot')) return;
    if (user.items.equipment[ItemSlot.Ammo]) return;

    // as a last resort, we traverse the sack, then slot the first item we find in ammo, then use it
    const firstShotIndex = user.items.sack.items.findIndex((i) => {
      const numShots = itemPropertyGet(i, 'shots');
      return numShots > 0;
    });

    if (firstShotIndex === -1) {
      return;
    }

    // we equip the ammo we found
    const item = user.items.sack.items[firstShotIndex];
    this.game.inventoryHelper.removeItemFromSack(user, firstShotIndex);
    this.game.characterHelper.setEquipmentSlot(user, ItemSlot.Ammo, item);
  }
}
