
import { IMacroCommandArgs, IPlayer } from '../../../../interfaces';
import { MacroCommand } from '../../../../models/macro';

export class Move extends MacroCommand {
  aliases = ['move'];
  canBeFast = true;

  execute(player: IPlayer, args: IMacroCommandArgs) {
    const [x, y] = args.arrayArgs.map(v => +v);
    this.game.movementHelper.moveWithPathfinding(player, { xDiff: x, yDiff: y });
  }
}
