import type { IMacroCommandArgs, IPlayer } from '@lotr/interfaces';
import { MacroCommand } from '../../../../models/macro';

export class GMSavePlayers extends MacroCommand {
  override aliases = ['@saveplayers', '@saveground', '@save', '@sp'];
  override isGMCommand = true;
  override canBeInstant = false;
  override canBeFast = false;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    this.game.playerManager.saveAllPlayers();
    this.game.groundManager.saveAllGround();
    this.sendMessage(player, 'Saved all players & ground.');
  }
}
