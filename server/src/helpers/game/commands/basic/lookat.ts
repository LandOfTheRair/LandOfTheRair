import { IMacroCommandArgs, IPlayer } from '../../../../interfaces';
import { MacroCommand } from '../../../../models/macro';

export class LookAt extends MacroCommand {

  aliases = ['look at', 'consider'];
  canBeInstant = false;
  canBeFast = true;

  execute(player: IPlayer, args: IMacroCommandArgs) {
    const target = this.game.targettingHelper.getFirstPossibleTargetInViewRange(player, args.stringArgs);

    if (!target) {
      this.sendMessage(player, 'You don\'t see that target!');
      return;
    }

    const description = `
    You are looking at a being named ${target.name}.
    The target is of ${(target.alignment || 'unknown').toLowerCase()} alignment.`;

    this.sendMessage(player, description);
  }
}
