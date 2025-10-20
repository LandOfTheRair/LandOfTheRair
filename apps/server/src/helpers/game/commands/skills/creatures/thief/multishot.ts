import { itemPropertyGet, traitLevelValue } from '@lotr/content';
import { SpellCommand } from '@lotr/core';
import type { ICharacter, IMacroCommandArgs, IPlayer } from '@lotr/interfaces';
import { ItemSlot } from '@lotr/interfaces';

export class Multishot extends SpellCommand {
  override aliases = ['multishot', 'cast multishot'];
  override requiresLearn = true;

  override mpCost() {
    return 0;
  }

  override canCastSpell() {
    return true;
  }

  override range(): number {
    return 4;
  }

  override canUse(char: ICharacter, target: ICharacter): boolean {
    const weapon = char.items.equipment[ItemSlot.RightHand];
    const canShoot = itemPropertyGet(weapon, 'canShoot');
    return weapon && canShoot && char.items.equipment[ItemSlot.Ammo];
  }

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    const target = this.game.targettingHelper.getFirstPossibleTargetInViewRange(
      player as IPlayer,
      args.stringArgs,
    );
    if (!target) {
      return this.youDontSeeThatPerson(player as IPlayer, args.stringArgs);
    }

    if (target === player) return;

    const range = this.calcPlainAttackRange(player);
    if (range === -1) {
      return this.sendMessage(
        player,
        'You need to have your left hand empty to use that weapon!',
      );
    }

    const weapon = player.items.equipment[ItemSlot.RightHand];
    const canShoot = itemPropertyGet(weapon, 'canShoot');
    if (!weapon || !canShoot) {
      return this.sendMessage(player, 'You need a ranged weapon to shoot!');
    }

    if (!player.items.equipment[ItemSlot.Ammo]) {
      return this.sendMessage(player, 'You are out of ammo!');
    }

    this.use(player, target);
  }

  override use(char: ICharacter, target: ICharacter): void {
    let attacks = 2;
    let damageMult = 0.8;

    if (traitLevelValue(char, 'TripleShot')) {
      attacks += 1;
      damageMult -= 0.1;
    }

    for (let i = 0; i < attacks; i++) {
      const args = {
        damageMult,
        attackRange: 4,
        numAttacks: attacks,
        attackNum: i,
      };
      this.game.combatHelper.physicalAttack(char, target, args);

      // bouncing arrows
      if (char && target) {
        this.game.combatHelper.attemptArrowBounce(char, target, args);
      }
    }
  }
}
