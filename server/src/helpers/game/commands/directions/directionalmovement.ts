import { Direction, IMacroCommandArgs, IPlayer } from '../../../../interfaces';
import { MacroCommand } from '../../../../models/macro';

export class DirectionalMovement extends MacroCommand {
  aliases = ['e', 'w', 's', 'n', 'nw', 'ne', 'sw', 'se'];
  canBeFast = true;

  execute(player: IPlayer, args: IMacroCommandArgs) {
    const totalMoves = Array<Direction>();
    totalMoves.push(args.calledAlias as Direction);

    if (args.stringArgs) {
      const additionalMoves = args.stringArgs.split(' ');
      additionalMoves.forEach(element => totalMoves.push(element as Direction));
    }

    totalMoves.slice(0, player.stats.move || 3).forEach(element => {
        const { x, y } = this.game.directionHelper.getXYFromDir( element as Direction);
        this.game.movementHelper.moveWithPathfinding(player, { xDiff: x, yDiff: y });
      });
  }
}
