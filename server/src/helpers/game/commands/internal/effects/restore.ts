
import { IMacroCommandArgs, IPlayer } from '../../../../../interfaces';
import { MacroCommand } from '../../../../../models/macro';

export class RestoreCommand extends MacroCommand {

  aliases = ['restore'];
  canBeFast = true;
  canUseWhileDead = true;

  execute(player: IPlayer, args: IMacroCommandArgs) {
    if (!this.game.characterHelper.isDead(player)) {
      this.sendMessage(player, 'You aren\'t dead!');
      return;
    }

    this.sendMessage(player, `Your soul departs the scene of it's death and returns to the mortal realm...`);

    this.game.deathHelper.restore(player);
  }

}
