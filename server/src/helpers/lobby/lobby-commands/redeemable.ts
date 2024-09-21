import { GameAction, ILobbyCommand } from '../../../interfaces';

import { Game } from '../../core';

export class CreateRedeemable implements ILobbyCommand {
  name = '/redeemable';
  syntax = '/redeemable <redeemish>';

  async do(message: string, game: Game, emit: (args) => void) {
    const redeemish = message.split('/redeemable ')[1]?.trim();
    if (!redeemish) return false;

    const redeemableArgs = game.messageHelper.getMergeObjectFromArgs(redeemish);

    if (redeemableArgs.item) {
      if (!game.contentManager.hasItemDefinition(redeemableArgs.item)) {
        emit({
          action: GameAction.ChatAddMessage,
          timestamp: Date.now(),
          message: `Item ${redeemableArgs.item} does not exist.`,
          from: '★System',
        });

        return true;
      }
    }

    console.log(redeemableArgs);

    try {
      const redeemable = await game.redeemableDB.addRedeemable(redeemableArgs);
      if (!redeemable) {
        emit({
          action: GameAction.ChatAddMessage,
          timestamp: Date.now(),
          message: `Could not create redeemable with args: "${redeemish}". Try again.`,
          from: '★System',
        });

        return true;
      }

      emit({
        action: GameAction.ChatAddMessage,
        timestamp: Date.now(),
        message: `Created redeemable with the code: ${redeemable.code} - for "${redeemish}"`,
        from: '★System',
      });
    } catch (e: any) {
      emit({
        action: GameAction.ChatAddMessage,
        timestamp: Date.now(),
        message: e.message,
        from: '★System',
      });

      return true;
    }

    return true;
  }
}
