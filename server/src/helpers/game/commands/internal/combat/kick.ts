import { ICharacter, IMacroCommandArgs, IPlayer, PhysicalAttackArgs } from '../../../../../interfaces';
import { SkillCommand } from '../../../../../models/macro';

export class KickCommand extends SkillCommand {

  aliases = ['k', 'kick'];

  range(char: ICharacter) {
    return 0;
  }

  execute(player: IPlayer, args: IMacroCommandArgs) {
    if (!args.stringArgs) return false;

    const range = this.range(player);
    if (range === -1) return;

    const target = this.game.targettingHelper.getFirstPossibleTargetInViewRange(player, args.stringArgs);
    if (!target) return this.youDontSeeThatPerson(player);

    if (target === player) return;

    if (this.game.directionHelper.distFrom(player, target) > range) return this.sendMessage(player, 'That target is too far away!');

    this.use(player, target);
  }

  use(user: ICharacter, target: ICharacter, opts: PhysicalAttackArgs = {}): void {
    opts.isKick = true;
    opts.attackRange = 0;
    this.game.combatHelper.physicalAttack(user, target, opts);
  }

}
