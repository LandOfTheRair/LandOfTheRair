import { IMacroCommandArgs, IPlayer } from '../../../../interfaces';
import { MacroCommand } from '../../../../models/macro';

export class LookAt extends MacroCommand {

  override aliases = ['look at', 'consider'];
  override canBeInstant = false;
  override canBeFast = true;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
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
