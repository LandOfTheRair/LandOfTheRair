import { Parser } from 'muud';

import { Game } from '../../../../helpers';
import { BaseClass, GameServerResponse, IAIBehavior, IDialogChatAction,
  IMPDocBehavior, INPC, IPlayer, ItemSlot, Stat } from '../../../../interfaces';

export class MPDocBehavior implements IAIBehavior {

  init(game: Game, npc: INPC, parser: Parser, behavior: IMPDocBehavior) {

    const mpTiers: Record<BaseClass, number[]> = {
      [BaseClass.Mage]:       [0, 0, 1000, 2000],
      [BaseClass.Thief]:      [0, 0, 300, 500],
      [BaseClass.Healer]:     [0, 0, 900, 1800],
      [BaseClass.Warrior]:    [0, 0, 200, 400],
      [BaseClass.Traveller]:  [0, 0, 0, 0]
    };

    const levelTiers = [0, 13, 25, 50];

    const mpNormalizers = [100, 200, 300, 1500];

    const mpCosts = [
      { min: 100,     max: 500 },
      { min: 10000,   max: 30000 },
      { min: 200000,  max: 2000000 },
      { min: 2000000, max: 20000000 }
    ];

    const { mpTier } = behavior;
    const tier = mpTier ?? 1;

    parser.addCommand('hello')
      .setSyntax(['hello'])
      .setLogic(async ({ env }) => {
        const player: IPlayer = env?.player;
        if (!player) return 'You do not exist.';

        if (game.directionHelper.distFrom(player, npc) > 2) return 'Closer move.';

        const message = `${player.name}, greet! Am exiled scientist of Rys descent.
        Taught forbidden arts of increase magic force. Interest? Hold gold, ask TEACH.`;

        const formattedChat: IDialogChatAction = {
          message,
          displayTitle: npc.name,
          displayNPCName: npc.name,
          displayNPCSprite: npc.sprite,
          displayNPCUUID: npc.uuid,
          options: [
            { text: 'Teach me', action: 'teach' },
            { text: 'Leave', action: 'noop' },
          ]
        };

        game.transmissionHelper.sendResponseToAccount(player.username, GameServerResponse.DialogChat, formattedChat);

        return message;
      });

    parser.addCommand('teach')
      .setSyntax(['teach'])
      .setLogic(async ({ env }) => {
        const player: IPlayer = env?.player;
        if (!player) return 'You do not exist.';

        if (game.directionHelper.distFrom(player, npc) > 2) return 'Closer move.';

        const levelTier = levelTiers[tier];
        if (player.level < levelTier) return 'Not experience enough for teach!';

        const playerBaseMp = game.characterHelper.getBaseStat(player, Stat.MP);
        const maxMpForTier = mpTiers[player.baseClass][tier];
        if (playerBaseMp > maxMpForTier) return 'Too powerful! No help!';

        const rightHand = player.items.equipment[ItemSlot.RightHand];
        if (!rightHand || rightHand.name !== 'Gold Coin') return 'No gold! No help!';

        let cost = game.calculatorHelper.calcRequiredGoldForNextHPMP(player, Stat.MP, maxMpForTier, mpNormalizers[tier], mpCosts[tier]);
        let totalMPGained = 0;
        let totalAvailable = rightHand.mods.value ?? 0;
        let totalCost = 0;

        if (cost > totalAvailable) return `Need ${cost.toLocaleString()} gold for magic force!`;

        while (cost > 0 && cost <= totalAvailable) {
          totalAvailable -= cost;
          totalCost += cost;
          totalMPGained++;
          game.characterHelper.gainPermanentStat(player, Stat.MP, 1);
          const mp = game.characterHelper.getBaseStat(player, Stat.MP);

          if (mp >= maxMpForTier) {
            cost = -1;
          } else {
            cost = game.calculatorHelper.calcRequiredGoldForNextHPMP(player, Stat.MP, maxMpForTier, mpNormalizers[tier], mpCosts[tier]);
          }
        }

        if (totalAvailable === 0) {
          totalAvailable = 1;
          totalCost -= 1;
        }

        rightHand.mods.value = totalAvailable;

        game.characterHelper.calculateStatTotals(player);

        return `Gained ${totalMPGained} magic forces! Cost ${totalCost.toLocaleString()} gold!`;
      });
  }

  tick() {}
}
