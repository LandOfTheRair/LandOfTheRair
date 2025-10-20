import { settingIsAIActive, toggleAIFreeze } from '@lotr/content';
import { MacroCommand } from '@lotr/core';
import type { IPlayer } from '@lotr/interfaces';

export class GMFreezeAI extends MacroCommand {
  override aliases = ['@freezeai', '@fa'];
  override isGMCommand = true;
  override canBeInstant = false;
  override canBeFast = false;

  override execute(player: IPlayer) {
    toggleAIFreeze();
    this.sendMessage(
      player,
      'AI is now ' + (settingIsAIActive() ? 'active' : 'frozen') + '.',
    );
  }
}
