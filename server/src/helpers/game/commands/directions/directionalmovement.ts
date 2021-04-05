import { Direction, IMacroCommandArgs, IPlayer, Stat } from '../../../../interfaces';
import { MacroCommand } from '../../../../models/macro';

export class DirectionalMovement extends MacroCommand {
  override aliases = ['e', 'w', 's', 'n', 'nw', 'ne', 'sw', 'se'];
  override canBeFast = true;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    const totalMoves: Direction[] = [];
    totalMoves.push(args.calledAlias as Direction);

    if (args.stringArgs) {
      const additionalMoves = args.stringArgs.split(' ');
      additionalMoves.forEach(element => totalMoves.push(element as Direction));
    }

    totalMoves.slice(0, this.game.characterHelper.getStat(player, Stat.Move)).forEach(element => {
      const { x, y } = this.game.directionHelper.getXYFromDir( element as Direction);
      this.game.movementHelper.moveWithPathfinding(player, { xDiff: x, yDiff: y });
    });
  }
}
