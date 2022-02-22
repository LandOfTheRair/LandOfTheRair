

import { distanceFrom, ICharacter, IMacroCommandArgs, IPlayer, PhysicalAttackArgs } from '../../../../../interfaces';
import { SkillCommand } from '../../../../../models/macro';

export class AttackCommand extends SkillCommand {

  override aliases = ['a', 'attack'];

  override range(char: ICharacter) {
    return this.calcPlainAttackRange(char);
  }

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    if (!args.stringArgs) return false;

    const range = this.range(player);
    if (range === -1) return this.sendMessage(player, 'You need to have your left hand empty to use that weapon!');

    const target = this.game.targettingHelper.getFirstPossibleTargetInViewRange(player, args.stringArgs);
    if (!target) return this.youDontSeeThatPerson(player, args.stringArgs);

    if (target === player) return;

    if (distanceFrom(player, target) > range) return this.sendMessage(player, 'That target is too far away!');

    this.use(player, target, { attackRange: range });
  }

  override use(user: ICharacter, target: ICharacter, opts: PhysicalAttackArgs = {}): void {
    opts.attackRange = this.range(user);
    this.game.combatHelper.physicalAttack(user, target, opts);

    // bouncing arrows
    if (opts.attackRange > 1 && user && target) {
      this.game.combatHelper.attemptArrowBounce(user, target, opts);
    }
  }

}
