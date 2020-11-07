import { IMacroCommandArgs, IPlayer, ISimpleItem } from '../../../../interfaces';
import { MacroCommand } from '../../../../models/macro';

export class Chase extends MacroCommand {

  aliases = ['chase'];
  canBeInstant = false;
  canBeFast = true;

  execute(player: IPlayer, args: IMacroCommandArgs) {
    const state = this.game.worldManager.getMapStateForCharacter(player);
    const playersInView = state.getAllPlayersInRange(player, 4);
    const target = this.game.targettingHelper.getFirstPossibleTargetInViewRange(player, args.stringArgs);

    if (!target) {
      this.sendMessage(player, 'You don\'t see that target!');
      return;
    }

    const xDiff = target.x - player.x;
    const yDiff = target.y - player.y;

    this.game.movementHelper.moveWithPathfinding(player, { xDiff, yDiff });
  }
}
