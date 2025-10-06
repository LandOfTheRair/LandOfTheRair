import type { IMacroCommandArgs, INPC, IPlayer } from '@lotr/interfaces';
import { MacroCommand } from '../../../../../models/macro';

export class PrivateSay extends MacroCommand {
  override aliases = ['privatesay'];
  override canBeInstant = true;
  override canBeFast = true;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    const aargs = args.stringArgs.split(',').map((x) => x.trim());
    if (aargs.length < 2) return;

    const target = this.game.targettingHelper.getFirstPossibleTargetInViewRange(
      player,
      aargs[0],
    );
    if (!target) return this.youDontSeeThatPerson(player, args.stringArgs);

    if ((target as any).dialogParser) {
      this.game.dialogActionHelper.handleDialog(
        player,
        target as INPC,
        aargs[1],
        args.callbacks,
      );
      return;
    }

    const msg = this.game.messageHelper.truncateMessage(
      this.game.profanityHelper.cleanMessage(aargs[1]),
    );
    this.game.messageHelper.sendPrivateMessage(player, target, msg);
  }
}
