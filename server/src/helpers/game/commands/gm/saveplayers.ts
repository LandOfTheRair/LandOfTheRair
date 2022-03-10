import { IMacroCommandArgs, IPlayer } from '../../../../interfaces';
import { MacroCommand } from '../../../../models/macro';

export class GMSavePlayers extends MacroCommand {

  override aliases = ['@saveplayers', '@save', '@sp'];
  override isGMCommand = true;
  override canBeInstant = false;
  override canBeFast = false;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    this.game.playerManager.saveAllPlayers();
    this.sendMessage(player, 'Saved all players.');

  }
}
