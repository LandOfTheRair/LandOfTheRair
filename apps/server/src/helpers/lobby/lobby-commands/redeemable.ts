import { itemExists } from '@lotr/content';
import type { ILobbyCommand } from '../../../interfaces';

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import type { IServerGame } from '@lotr/interfaces';

export class CreateRedeemable implements ILobbyCommand {
  name = '/redeemable';
  syntax = '/redeemable <redeemish>';

  async do(message: string, game: IServerGame, emit: (args) => void) {
    const redeemish = message.split('/redeemable ')[1]?.trim();
    if (!redeemish) return false;

    const redeemableArgs = game.messageHelper.getMergeObjectFromArgs(redeemish);

    if (redeemableArgs.item) {
      if (!itemExists(redeemableArgs.item)) {
        emit(
          game.messageHelper.getSystemMessageObject(
            `Item ${redeemableArgs.item} does not exist.`,
          ),
        );

        return true;
      }
    }

    try {
      const redeemable = await game.redeemableDB.addRedeemable(redeemableArgs);
      if (!redeemable) {
        emit(
          game.messageHelper.getSystemMessageObject(
            `Could not create redeemable with args: "${redeemish}". Try again.`,
          ),
        );

        return true;
      }

      emit(
        game.messageHelper.getSystemMessageObject(
          `Created redeemable with the code: ${redeemable.code} - for "${redeemish}"`,
        ),
      );
    } catch (e: any) {
      emit(game.messageHelper.getSystemMessageObject(e.message));

      return true;
    }

    return true;
  }
}
