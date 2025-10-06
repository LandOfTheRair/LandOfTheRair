import type { IMacroCommandArgs, IPlayer } from '@lotr/interfaces';
import { MacroCommand } from '../../../../../models/macro';

export class TradeToggleCommand extends MacroCommand {
  override aliases = ['trade enable', 'trade disable'];

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    player.isTradeEnabled = !player.isTradeEnabled;

    this.sendChatMessage(
      player,
      `Trade ${player.isTradeEnabled ? 'ENABLED' : 'DISABLED'}.`,
    );
  }
}
