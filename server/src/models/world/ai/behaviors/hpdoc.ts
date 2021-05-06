import { Parser } from 'muud';

import { Game } from '../../../../helpers';
import { BaseClass, distanceFrom, GameServerResponse, IAIBehavior,
  IDialogChatAction, IHPDocBehavior, INPC, IPlayer, ItemSlot, Stat } from '../../../../interfaces';

export class HPDocBehavior implements IAIBehavior {

  init(game: Game, npc: INPC, parser: Parser, behavior: IHPDocBehavior) {

    const hpTiers: Record<BaseClass, number[]> = {
      [BaseClass.Mage]:       [100, 375, 600, 2400],
      [BaseClass.Thief]:      [100, 425, 700, 2800],
      [BaseClass.Healer]:     [100, 400, 650, 2600],
      [BaseClass.Warrior]:    [100, 450, 800, 3000],
      [BaseClass.Traveller]:  [100, 600, 550, 2200]
    };

    const levelTiers = [0, 13, 25, 50];

    const hpNormalizers = [100, 200, 300, 1500];

    const hpCosts = [
      { min: 100,     max: 500 },
      { min: 5000,    max: 15000 },
      { min: 100000,  max: 1000000 },
      { min: 1000000, max: 10000000 }
    ];

    const { hpTier } = behavior;
    const tier = hpTier ?? 1;

    parser.addCommand('hello')
      .setSyntax(['hello'])
      .setLogic(async ({ env }) => {
        const player: IPlayer = env?.player;
        if (!player) return 'You do not exist.';

        if (distanceFrom(player, npc) > 2) return 'Closer move.';

        const message = `${player.name}, greet! Am exiled scientist of Rys descent.
        Taught forbidden arts of increase life force. Interest? Hold gold, ask TEACH.`;

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

        if (distanceFrom(player, npc) > 2) return 'Closer move.';

        const levelTier = levelTiers[tier];
        if (player.level < levelTier) return 'Not experience enough for teach!';

        const playerBaseHp = game.characterHelper.getBaseStat(player, Stat.HP);
        const maxHpForTier = hpTiers[player.baseClass][tier];
        if (playerBaseHp > maxHpForTier) return 'Too powerful! No help!';

        const rightHand = player.items.equipment[ItemSlot.RightHand];
        if (!rightHand || rightHand.name !== 'Gold Coin') return 'No gold! No help!';

        let cost = game.calculatorHelper.calcRequiredGoldForNextHPMP(player, Stat.HP, maxHpForTier, hpNormalizers[tier], hpCosts[tier]);
        let totalHPGained = 0;
        let totalAvailable = rightHand.mods.value ?? 0;
        let totalCost = 0;

        if (cost > totalAvailable) return `Need ${cost.toLocaleString()} gold for life force!`;

        while (cost > 0 && cost <= totalAvailable) {
          totalAvailable -= cost;
          totalCost += cost;
          totalHPGained++;
          game.characterHelper.gainPermanentStat(player, Stat.HP, 1);
          const hp = game.characterHelper.getBaseStat(player, Stat.HP);

          if (hp >= maxHpForTier) {
            cost = -1;
          } else {
            cost = game.calculatorHelper.calcRequiredGoldForNextHPMP(player, Stat.HP, maxHpForTier, hpNormalizers[tier], hpCosts[tier]);
          }
        }

        if (totalAvailable === 0) {
          totalAvailable = 1;
          totalCost -= 1;
        }

        rightHand.mods.value = totalAvailable;

        game.characterHelper.calculateStatTotals(player);

        return `Gained ${totalHPGained} life forces! Cost ${totalCost.toLocaleString()} gold!`;
      });
  }

  tick() {}
}
