import { Parser } from 'muud';

import { Game } from '../../../../helpers';
import {
  distanceFrom,
  GameServerResponse,
  IAIBehavior,
  IDialogChatAction,
  IMPDocBehavior,
  INPC,
  IPlayer,
  ItemSlot,
  Stat,
} from '../../../../interfaces';

export class MPDocBehavior implements IAIBehavior {
  init(game: Game, npc: INPC, parser: Parser, behavior: IMPDocBehavior) {
    const levelTiers = game.contentManager.getGameSetting(
      'npcscript',
      'mpdoc.levels',
    ) ?? [0, 13, 25, 50];

    const mpNormalizers = game.contentManager.getGameSetting(
      'npcscript',
      'mpdoc.normalizers',
    ) ?? [100, 200, 300, 1500];

    const mpCosts = game.contentManager.getGameSetting(
      'npcscript',
      'mpdoc.costs',
    ) ?? [
      { min: 100, max: 500 },
      { min: 10000, max: 30000 },
      { min: 200000, max: 2000000 },
      { min: 2000000, max: 20000000 },
    ];

    const { mpTier } = behavior;
    const tier = mpTier ?? 1;

    parser
      .addCommand('hello')
      .setSyntax(['hello'])
      .setLogic(async ({ env }) => {
        const player: IPlayer = env?.player;
        if (!player) return 'You do not exist.';

        if (distanceFrom(player, npc) > 2) return 'Closer move.';

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
          ],
        };

        game.transmissionHelper.sendResponseToAccount(
          player.username,
          GameServerResponse.DialogChat,
          formattedChat,
        );

        return message;
      });

    parser
      .addCommand('teach')
      .setSyntax(['teach'])
      .setLogic(async ({ env }) => {
        const player: IPlayer = env?.player;
        if (!player) return 'You do not exist.';

        if (distanceFrom(player, npc) > 2) return 'Closer move.';

        const levelTier = levelTiers[tier];
        if (player.level < levelTier) return 'Not experience enough for teach!';

        const mpTiers = game.contentManager.getClassConfigSetting<'mpMaxes'>(
          player.baseClass,
          'mpMaxes',
        );

        if (!mpTiers) return 'Unsure how help!';

        const playerBaseMp = game.characterHelper.getBaseStat(player, Stat.MP);
        const maxMpForTier = mpTiers[tier];
        if (playerBaseMp > maxMpForTier) return 'Too powerful! No help!';

        const rightHand = player.items.equipment[ItemSlot.RightHand];
        if (!rightHand || rightHand.name !== 'Gold Coin') {
          return 'No gold! No help!';
        }

        let cost = game.calculatorHelper.calcRequiredGoldForNextHPMP(
          player,
          Stat.MP,
          maxMpForTier,
          mpNormalizers[tier],
          mpCosts[tier],
        );
        let totalMPGained = 0;
        let totalAvailable = rightHand.mods.value ?? 0;
        let totalCost = 0;

        if (cost > totalAvailable) {
          return `Need ${cost.toLocaleString()} gold for magic force!`;
        }

        while (cost > 0 && cost <= totalAvailable) {
          totalAvailable -= cost;
          totalCost += cost;
          totalMPGained++;
          game.characterHelper.gainPermanentStat(player, Stat.MP, 1);
          const mp = game.characterHelper.getBaseStat(player, Stat.MP);

          if (mp >= maxMpForTier) {
            cost = -1;
          } else {
            cost = game.calculatorHelper.calcRequiredGoldForNextHPMP(
              player,
              Stat.MP,
              maxMpForTier,
              mpNormalizers[tier],
              mpCosts[tier],
            );
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
