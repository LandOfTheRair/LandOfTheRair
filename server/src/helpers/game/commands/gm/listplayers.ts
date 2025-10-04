import {
  GameServerResponse,
  IMacroCommandArgs,
  IPlayer,
} from '../../../../interfaces';
import { MacroCommand } from '../../../../models/macro';

export class GMListPlayers extends MacroCommand {
  override aliases = ['@listplayers', '@lp', '@whois'];
  override isGMCommand = true;
  override canBeInstant = false;
  override canBeFast = false;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    const allPlayers = this.game.playerManager
      .getAllPlayers()
      .map((p) => `${p.name} (${p.username}) | ${p.map}:${p.x},${p.y}`);

    const message = `**All Players**: <br><br>${allPlayers.join('<br>')}`;

    this.sendMessage(player, message);

    args.callbacks.emit({
      type: GameServerResponse.SendAlert,
      title: `Player List`,
      content: message,
    });
  }
}
