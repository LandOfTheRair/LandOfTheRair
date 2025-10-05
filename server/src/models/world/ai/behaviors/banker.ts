import { Parser } from 'muud';

import { distanceFrom, Game } from '../../../../helpers';
import {
  Currency,
  GameAction,
  IAIBehavior,
  IBankerBehavior,
  INPC,
  IPlayer,
} from '../../../../interfaces';

export class BankerBehavior implements IAIBehavior {
  init(game: Game, npc: INPC, parser: Parser, behavior: IBankerBehavior) {
    const { bankId, branchId } = behavior;

    parser
      .addCommand('hello')
      .setSyntax(['hello'])
      .setLogic(async ({ env }) => {
        const player: IPlayer = env?.player;
        if (!player) return 'You do not exist.';

        if (distanceFrom(player, npc) > 2) return 'Please come closer.';

        env?.callbacks.emit({
          action: GameAction.NPCActionShowBank,
          npcUUID: npc.uuid,
          npcName: npc.name,
          npcSprite: npc.sprite,
          npcBank: bankId,
          npcBranch: branchId,
        });

        return `Hello, ${player.name}! Welcome to the ${bankId} Bank, ${branchId} branch.`;
      });

    parser
      .addCommand('deposit')
      .setSyntax(['deposit <string:amount*>'])
      .setLogic(async ({ env, args }) => {
        const player: IPlayer = env?.player;
        if (!player) return 'You do not exist.';

        if (distanceFrom(player, npc) > 2) return 'Please come closer.';

        let amount = game.userInputHelper.cleanNumber(args['amount*'], 0, {
          floor: true,
        });
        amount = Math.min(
          amount,
          game.currencyHelper.getCurrency(player, Currency.Gold),
        );
        if (amount <= 0) return 'You cannot deposit that much.';

        game.bankHelper.deposit(player, amount);

        return `You've deposited ${amount.toLocaleString()} coins. Thanks for your business!`;
      });

    parser
      .addCommand('withdraw')
      .setSyntax(['withdraw <string:amount*>'])
      .setLogic(async ({ env, args }) => {
        const player: IPlayer = env?.player;
        if (!player) return 'You do not exist.';

        if (distanceFrom(player, npc) > 2) return 'Please come closer.';

        let amount = game.userInputHelper.cleanNumber(args['amount*'], 0, {
          floor: true,
        });
        amount = Math.min(amount, player.bank.deposits[Currency.Gold] ?? 0);
        if (amount <= 0) return 'You cannot withdraw that much.';

        game.bankHelper.withdraw(player, amount);

        return `You've withdrawn ${amount.toLocaleString()} coins. Thanks for your business!`;
      });
  }

  tick() {}
}
