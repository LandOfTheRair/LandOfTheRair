import { isNumber, random } from 'lodash';
import type { Parser } from 'muud';

import type {
  IAIBehavior,
  ICharacter,
  IDialogChatAction,
  INPC,
  IPlayer,
  IServerGame,
} from '@lotr/interfaces';
import { Currency, GameServerResponse, ItemSlot } from '@lotr/interfaces';
import { distanceFrom } from '@lotr/shared';

import { gainCurrency } from '@lotr/currency';
import { transmissionSendResponseToAccount } from '../../../transmission';

export class ThanksgivingGunsBehavior implements IAIBehavior {
  init(game: IServerGame, npc: INPC, parser: Parser) {
    const currentNPCRefs: Record<string, INPC[]> = {};
    const currentTargets: Record<string, string> = {};
    const scores: Record<string, number> = {};
    const rounds: Record<string, number> = {};
    const clearTimers: Record<string, NodeJS.Timeout> = {};

    const cleanUpPlayerData = (uuid: string) => {
      if (currentNPCRefs[uuid]) {
        currentNPCRefs[uuid].forEach((targ) =>
          game.deathHelper.fakeNPCDie(targ),
        );
      }

      if (clearTimers[uuid]) clearTimeout(clearTimers[uuid]);

      delete currentNPCRefs[uuid];
      delete currentTargets[uuid];
      delete scores[uuid];
      delete rounds[uuid];
      delete clearTimers[uuid];
    };

    const startTargetPractice = (player: IPlayer) => {
      const uuid = player.uuid;

      const spawnNPCS = async () => {
        const mapRef = game.worldManager.getMap(npc.map);

        const doesPlayerExistStill = game.playerManager.getPlayerByUsername(
          player.username,
        );

        if (!player || !doesPlayerExistStill || player.map !== npc.map) {
          cleanUpPlayerData(uuid);
          return;
        }

        if (clearTimers[uuid]) return;

        rounds[uuid] = rounds[uuid] || 0;
        rounds[uuid]++;

        currentNPCRefs[uuid] = [];

        if (rounds[uuid] > 10) {
          game.messageHelper.sendPrivateMessage(
            npc,
            player,
            'Well done! Come see me for your reward!',
          );

          clearTimers[uuid] = setTimeout(() => {
            cleanUpPlayerData(uuid);
          }, 60000);
          return;
        }

        const realTargetNumber = random(1, 4);

        for (let i = 1; i <= 4; i++) {
          const npcSpawner = mapRef?.state.getNPCSpawnerByName(
            `Target Spawner ${i}`,
          );
          const target = npcSpawner?.forceSpawnNPC({
            createCallback: (targetNPC: INPC) => {
              targetNPC.name = `target ${i}`;
              targetNPC.affiliation =
                realTargetNumber === i ? 'Real Target' : 'Turkey Target';
              targetNPC.onlyVisibleTo = uuid;
            },
          });

          if (target) {
            currentNPCRefs[uuid].push(target);

            const ai = npcSpawner?.getNPCAI(target.uuid);
            if (ai) {
              ai.death = (killer: ICharacter) => {
                if (!killer) return;

                if (!currentTargets[killer.uuid]) return;
                const targetNecessary = currentTargets[killer.uuid];

                scores[killer.uuid] = scores[killer.uuid] || 0;

                if (targetNecessary === target.name) {
                  scores[killer.uuid]!++;
                } else {
                  scores[killer.uuid]!--;
                }
              };
            }
          }
        }

        currentTargets[uuid] = `target ${realTargetNumber}`;
        game.messageHelper.sendPrivateMessage(
          npc,
          player,
          `Round ${rounds[uuid]}: Hit **target ${realTargetNumber}**!`,
        );

        setTimeout(() => {
          if (currentNPCRefs[uuid]) {
            currentNPCRefs[uuid].forEach((targ) =>
              game.deathHelper.fakeNPCDie(targ),
            );
          }

          setTimeout(() => {
            spawnNPCS();
          }, 3000);
        }, 5000);
      };

      spawnNPCS();
    };

    parser
      .addCommand('hello')
      .setSyntax(['hello'])
      .setLogic(async ({ env }) => {
        const player = env?.player;
        if (!player) return 'You do not exist.';

        if (distanceFrom(player, npc) > 0) return 'Please move closer.';

        if (isNumber(scores[player.uuid]) || isNumber(rounds[player.uuid])) {
          if (rounds[player.uuid]! > 10) {
            const tokens = Math.max(10, scores[player.uuid]! * 10);
            game.messageHelper.sendLogMessageToPlayer(player, {
              message: `Planst hands you ${tokens} turkey coins!`,
            });
            gainCurrency(player, tokens, Currency.Thanksgiving);

            const rightHand = player.items.equipment[ItemSlot.RightHand];
            if (
              scores[player.uuid] === 10 &&
              rightHand &&
              rightHand.name === 'Thanksgiving Blunderbuss'
            ) {
              const item = game.itemCreator.getSimpleItem(
                'Thanksgiving Blunderbuss (Improved)',
              );
              game.characterHelper.setRightHand(player, item);
            }

            const score = scores[player.uuid];
            cleanUpPlayerData(player.uuid);

            return `Well done! Here is your reward! Your final score was ${score}.`;
          }

          return `Your current score is **${scores[player.uuid] ?? 0}**.`;
        }

        const message = `Want a chance to upgrade your weak Mark-I Blunderbuss?
        Want a BlunderBOSS? Participate in my TARGET PRACTICE and I'll reward you with a better gun!`;

        const formattedChat: IDialogChatAction = {
          message,
          displayTitle: npc.name,
          displayNPCName: npc.name,
          displayNPCSprite: npc.sprite,
          displayNPCUUID: npc.uuid,
          options: [
            { text: 'I can be a blunder boss?', action: 'target practice' },
            { text: 'Nope', action: 'noop' },
          ],
        };

        transmissionSendResponseToAccount(
          player.username,
          GameServerResponse.DialogChat,
          formattedChat,
        );

        return message;
      });

    parser
      .addCommand('target practice')
      .setSyntax(['target practice'])
      .setLogic(async ({ env }) => {
        const player = env?.player;
        if (!player) return 'You do not exist.';
        if (distanceFrom(player, npc) > 0) return 'Please move closer.';

        const message = `Yep! I will throw out some targets for you to hit, then tell you which one is the correct target.
        Hit all 10 correct targets, and talk to me afterwards, holding your old blunderbuss, to get a new one!
        You still get tokens if you don't, though! Just tell me when you want to START!`;

        const formattedChat: IDialogChatAction = {
          message,
          displayTitle: npc.name,
          displayNPCName: npc.name,
          displayNPCSprite: npc.sprite,
          displayNPCUUID: npc.uuid,
          options: [
            { text: 'Start!', action: 'start' },
            { text: 'Nope', action: 'noop' },
          ],
        };

        transmissionSendResponseToAccount(
          player.username,
          GameServerResponse.DialogChat,
          formattedChat,
        );

        return message;
      });

    parser
      .addCommand('start')
      .setSyntax(['start'])
      .setLogic(async ({ env }) => {
        const player = env?.player;
        if (!player) return 'You do not exist.';
        if (distanceFrom(player, npc) > 0) return 'Please move closer.';

        const rightHand = player.items.equipment[ItemSlot.RightHand];
        if (
          !rightHand ||
          (rightHand.name !== 'Thanksgiving Blunderbuss' &&
            rightHand.name !== 'Thanksgiving Blunderbuss (Improved)')
        ) {
          return 'You might want to hold a Blunderbuss Mark-I or Mark-II for this.';
        }

        if (isNumber(scores[player.uuid])) {
          return 'You are already doing this event! Wait until it is over.';
        }

        if (Object.keys(currentTargets).length >= 20) {
          return 'Too many players are doing this event, please come back later!';
        }

        startTargetPractice(player);
        return 'Good luck!';
      });
  }

  tick() {}
}
