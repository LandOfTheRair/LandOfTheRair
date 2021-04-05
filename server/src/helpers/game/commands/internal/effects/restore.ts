
import { IMacroCommandArgs, IPlayer } from '../../../../../interfaces';
import { MacroCommand } from '../../../../../models/macro';

export class RestoreCommand extends MacroCommand {

  override aliases = ['restore'];
  override canBeFast = true;
  override canUseWhileDead = true;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    if (!this.game.characterHelper.isDead(player)) {
      this.sendMessage(player, 'You aren\'t dead!');
      return;
    }

    this.sendMessage(player, 'Your soul departs the scene of it\'s death and returns to the mortal realm...');

    this.game.deathHelper.restore(player);
  }

}
