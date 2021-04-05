import { ICharacter, IMacroCommandArgs, IPlayer, PhysicalAttackArgs } from '../../../../../interfaces';
import { SkillCommand } from '../../../../../models/macro';

export class KickCommand extends SkillCommand {

  override aliases = ['k', 'kick'];

  override range(char: ICharacter) {
    return 0;
  }

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    if (!args.stringArgs) return false;

    const range = this.range(player);
    if (range === -1) return;

    const target = this.game.targettingHelper.getFirstPossibleTargetInViewRange(player, args.stringArgs);
    if (!target) return this.youDontSeeThatPerson(player, args.stringArgs);

    if (target === player) return;

    if (this.game.directionHelper.distFrom(player, target) > range) return this.sendMessage(player, 'That target is too far away!');

    this.use(player, target);
  }

  override use(user: ICharacter, target: ICharacter, opts: PhysicalAttackArgs = {}): void {
    opts.isKick = true;
    opts.attackRange = 0;
    this.game.combatHelper.physicalAttack(user, target, opts);
  }

}
