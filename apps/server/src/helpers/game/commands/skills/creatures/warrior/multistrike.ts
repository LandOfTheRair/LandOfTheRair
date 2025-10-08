import { traitLevelValue } from '@lotr/content';
import type {
  ICharacter,
  IMacroCommandArgs,
  IPlayer,
  PhysicalAttackArgs,
} from '@lotr/interfaces';
import { ItemSlot, WeaponClasses } from '@lotr/interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class Multistrike extends SpellCommand {
  override aliases = ['multistrike', 'art multistrike'];
  override requiresLearn = true;

  override range(char: ICharacter) {
    return this.calcPlainAttackRange(char);
  }

  override mpCost() {
    return 0;
  }

  override canCastSpell() {
    return true;
  }

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    const weapon = player.items.equipment[ItemSlot.RightHand];
    if (!weapon) {
      return this.sendMessage(
        player,
        'You need a weapon in your hand to multistrike!',
      );
    }

    const weaponClass = this.game.itemHelper.getItemProperty(
      weapon,
      'itemClass',
    );
    if (!WeaponClasses.includes(weaponClass)) {
      return this.sendMessage(
        player,
        'You need a weapon in your hand to multistrike!',
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
    const state = this.game.worldManager.getMapStateForCharacter(user);
    if (!state) return;

    const numTargets = 4 + traitLevelValue(user, 'Multitarget');

    const foundTargets = this.game.targettingHelper.getPossibleAOETargets(
      user,
      user,
      0,
      numTargets,
    );

    if (foundTargets.length === 0) {
      this.sendMessage(user, 'You swing your weapon wildly, hitting no one!');
      return;
    }

    foundTargets.forEach((chosenTarget, i) => {
      this.game.combatHelper.physicalAttack(user, chosenTarget, {
        ...opts,
        damageMult: 0.5,
        numAttacks: foundTargets.length,
        attackNum: i,
      });
    });

    const defensePenalty = 50 - traitLevelValue(user, 'Multifocus');
    if (defensePenalty > 0) {
      this.game.effectHelper.addEffect(user, user, 'LoweredDefenses', {
        effect: { extra: { potency: defensePenalty } },
      });
    }
  }
}
