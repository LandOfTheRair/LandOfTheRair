import { ICharacter, IMacroCommandArgs, IPlayer, PhysicalAttackArgs } from '../../../../../interfaces';
import { Skill } from '../../../../../models/macro';

export class AttackCommand extends Skill {

  aliases = ['attack'];

  range(char: ICharacter) {
    return this.calcPlainAttackRange(char);
  }

  execute(player: IPlayer, args: IMacroCommandArgs) {
    if (!args.stringArgs) return false;

    const range = this.range(player);
    if (range === -1) return this.sendMessage(player, 'You need to have your left hand empty to use that weapon!');

    const target = this.game.targettingHelper.getFirstPossibleTargetInViewRange(player, args.stringArgs);
    if (!target) return this.youDontSeeThatPerson(player);

    if (target === player) return;

    if (this.game.directionHelper.distFrom(player, target) > range) return this.sendMessage(player, 'That target is too far away!');

    this.use(player, target);
  }

  use(user: ICharacter, target: ICharacter, opts: PhysicalAttackArgs = {}): void {
    this.game.combatHelper.physicalAttack(user, target, opts);
  }

}
