import type { Parser } from 'muud';

import { equipmentItemGet, trinketLevelUp } from '@lotr/characters';
import { itemGet, itemIsOwnedBy, itemPropertyGet } from '@lotr/content';
import { hasCurrency, loseCurrency } from '@lotr/currency';
import type { ITrinketManager, Stat } from '@lotr/interfaces';
import {
  Currency,
  ItemSlot,
  type IAIBehavior,
  type INPC,
  type IServerGame,
} from '@lotr/interfaces';
import { consoleError } from '@lotr/logger';
import {
  distanceFrom,
  trinketCanLevelUp,
  trinketExpMax,
  trinketGoldCost,
} from '@lotr/shared';
import { dialogSendNPCMessageToPlayer } from '../../dialog';

export class TrinketManagerBehavior implements IAIBehavior {
  init(
    game: IServerGame,
    npc: INPC,
    parser: Parser,
    behavior: ITrinketManager,
  ) {
    if (!behavior.trinketName || !behavior.exchangeTrinketItem) {
      consoleError(
        'Behavior:TrinketManager',
        new Error(
          `NPC at ${npc.map}-${npc.x},${npc.y} is missing trinketName or exchangeTrinketItem.`,
        ),
      );
      return;
    }

    const neededItem = game.itemCreator.getSimpleItem(
      behavior.exchangeTrinketItem,
    );
    if (!neededItem) {
      consoleError(
        'Behavior:TrinketManager',
        new Error(
          `NPC at ${npc.map}-${npc.x},${npc.y} references an invalid exchangeTrinketItem.`,
        ),
      );
      return;
    }

    game.characterHelper.setEquipmentSlot(
      npc,
      ItemSlot.RightHand,
      game.itemCreator.getSimpleItem(behavior.trinketName),
    );

    try {
      parser
        .addCommand('hello')
        .setSyntax(['hello'])
        .setLogic(async ({ env }) => {
          const player = env?.player;
          if (!player) return 'You do not exist.';

          if (distanceFrom(player, npc) > 0) return 'Please come closer.';

          const playerRightHand = equipmentItemGet(player, ItemSlot.RightHand);
          if (playerRightHand) {
            if (playerRightHand.name === neededItem.name) {
              if (!itemIsOwnedBy(player, playerRightHand)) {
                const ownedMessage =
                  'I can only take your items, not someone elses.';
                dialogSendNPCMessageToPlayer(player, npc, ownedMessage);

                return ownedMessage;
              }

              game.characterHelper.setRightHand(
                player,
                game.itemCreator.getSimpleItem(behavior.trinketName),
              );

              const doneMessage = `Done! This is a very powerful item that has its own growth potential.
              When it glows, bring it to me and I can help unlock its latent power.`;

              dialogSendNPCMessageToPlayer(player, npc, doneMessage);

              return doneMessage;
            }

            if (playerRightHand.name === behavior.trinketName) {
              if (!itemIsOwnedBy(player, playerRightHand)) {
                const ownedMessage =
                  'I can only take your items, not someone elses.';
                dialogSendNPCMessageToPlayer(player, npc, ownedMessage);

                return ownedMessage;
              }

              const trinketDef = itemGet(behavior.trinketName);
              if (!trinketDef) return 'I have no use for that.';

              const nextLevelCost = trinketGoldCost(
                playerRightHand,
                trinketDef,
              );

              if (trinketCanLevelUp(playerRightHand, trinketDef)) {
                if (!hasCurrency(player, nextLevelCost, Currency.Gold)) {
                  const goldMessage = `You need ${nextLevelCost.toLocaleString()} gold to level up your item.`;
                  dialogSendNPCMessageToPlayer(player, npc, goldMessage);
                  return goldMessage;
                }

                loseCurrency(player, nextLevelCost, Currency.Gold);
                const levelUpMessage = `The power level of your item has been increased.`;
                trinketLevelUp(playerRightHand);

                dialogSendNPCMessageToPlayer(player, npc, levelUpMessage);

                return levelUpMessage;
              }

              const currentLevel =
                itemPropertyGet(playerRightHand, 'levelup')?.currentLevel ?? 0;
              const currentXp =
                itemPropertyGet(playerRightHand, 'levelup')?.currentXp ?? 0;
              const maxXp = trinketExpMax(playerRightHand, trinketDef);
              const maxLevel = trinketDef.levelup?.maxLevel ?? 0;
              const statsPerLevel = trinketDef.levelup?.statsPerLevel ?? {};

              const statsString = Object.keys(statsPerLevel)
                .map((stat) => {
                  const statValue =
                    (statsPerLevel[stat as Stat] ?? 0) * currentLevel;
                  return `${stat.toUpperCase()} +${statValue}`;
                })
                .join(', ');

              const infoMessage = `Your item is currently level ${currentLevel}/${maxLevel}.
              <br>It is ${((currentXp / maxXp) * 100).toFixed(3)}% towards its next power level.
              <br>The next power level will cost ${nextLevelCost.toLocaleString()} gold to unlock.
              ${statsString ? `<br><br>It offers the following boosts: ${statsString}` : ''}.`;

              dialogSendNPCMessageToPlayer(player, npc, infoMessage);
              return infoMessage;
            }

            return 'I have no use for that.';
          }

          const message = `Greetings, ${player.name}.
          If you can bring me ${itemPropertyGet(neededItem, 'desc')}, I'll trade it for what I've got here.
          I assure you, the trade is worthwhile.`;

          dialogSendNPCMessageToPlayer(player, npc, message);

          return message;
        });
    } catch {}
  }

  public tick() {}
}
