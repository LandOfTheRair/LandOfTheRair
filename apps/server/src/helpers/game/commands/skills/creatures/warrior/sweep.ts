import type {
  ICharacter,
  IMacroCommandArgs,
  IPlayer,
  PhysicalAttackArgs,
} from '@lotr/interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class Sweep extends SpellCommand {
  override aliases = ['sweep', 'art sweep'];
  override requiresLearn = true;

  override mpCost() {
    return 0;
  }

  override canCastSpell() {
    return true;
  }

  override range(char: ICharacter) {
    return 0;
  }

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    this.use(player, player, { attackRange: 0 });
  }

  override use(
    user: ICharacter,
    target: ICharacter,
    opts: PhysicalAttackArgs = {},
  ): void {
    const state = this.game.worldManager.getMapStateForCharacter(user);
    if (!state) return;

    const foundTargets = this.game.targettingHelper.getPossibleAOETargets(
      user,
      user,
      0,
      8,
    );

    if (foundTargets.length === 0) {
      this.sendMessage(user, 'You kick around wildly, hitting no one!');
      return;
    }

    const damageMult =
      1 + this.game.traitHelper.traitLevelValue(user, 'StrongSweep');

    foundTargets.forEach((chosenTarget, i) => {
      this.game.combatHelper.physicalAttack(user, chosenTarget, {
        ...opts,
        isKick: true,
        damageMult,
        numAttacks: foundTargets.length,
        attackNum: i,
      });
    });

    const defensePenalty = 25;
    if (defensePenalty > 0) {
      this.game.effectHelper.addEffect(user, user, 'LoweredDefenses', {
        effect: { extra: { potency: defensePenalty } },
      });
    }
  }
}
