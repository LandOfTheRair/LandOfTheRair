import type { IPlayer } from '@lotr/interfaces';
import { MacroCommand } from '../../../../models/macro';

export class GMFreezeAI extends MacroCommand {
  override aliases = ['@freezeai', '@fa'];
  override isGMCommand = true;
  override canBeInstant = false;
  override canBeFast = false;

  override execute(player: IPlayer) {
    this.game.configManager.toggleAIFreeze();
    this.sendMessage(
      player,
      'AI is now ' +
        (this.game.configManager.isAIActive ? 'active' : 'frozen') +
        '.',
    );
  }
}
