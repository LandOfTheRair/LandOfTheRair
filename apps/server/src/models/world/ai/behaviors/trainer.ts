import {
  assessPercentToNextSkill,
  calcSkillLevelForCharacter,
  calculateSkillXPRequiredForLevel,
} from '@lotr/exp';
import type {
  IAIBehavior,
  IDialogChatAction,
  INPC,
  IPlayer,
  ITrainerBehavior,
} from '@lotr/interfaces';
import {
  BaseClass,
  GameAction,
  GameServerResponse,
  ItemClass,
  ItemSlot,
  Skill,
  Stat,
} from '@lotr/interfaces';
import type { Parser } from 'muud';

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { settingClassConfigGet, settingGameGet } from '@lotr/content';
import { hasCurrency, loseCurrency } from '@lotr/currency';
import { consoleError } from '@lotr/logger';
import { distanceFrom } from '@lotr/shared';
import type { Game } from '../../../../helpers';
import type { Player } from '../../../orm';

export class TrainerBehavior implements IAIBehavior {
  private canRevive = false;
  private hasGuild = false;

  init(game: Game, npc: INPC, parser: Parser, behavior: ITrainerBehavior) {
    this.canRevive = behavior.trainClass.includes(BaseClass.Healer);
    this.hasGuild = behavior.trainClass.includes(BaseClass.Thief);

    const { maxLevelUpLevel, maxSkillTrain } = behavior;

    if (!maxLevelUpLevel || !maxSkillTrain) {
      consoleError(
        'Behavior:Trainer',
        new Error(
          `NPC at ${npc.map}-${npc.x},${npc.y} has invalid levelup/skillup settings.`,
        ),
      );
      return;
    }

    // default guidance
    parser
      .addCommand('hello')
      .setSyntax(['hello'])
      .setLogic(async ({ env }) => {
        const player: IPlayer = env?.player;
        if (!player) return 'You seem strange.';

        if (distanceFrom(player, npc) > 0) return 'Please come closer.';

        if (!behavior.joinClass && player.baseClass !== BaseClass.Traveller) {
          env?.callbacks.emit({
            type: GameServerResponse.SendAlert,
            title: 'Leave Me Alone',
            content: `We have no business, ${player.name}.`,
            extraData: { npcSprite: npc.sprite },
          });

          return `We have no business, ${player.name}.`;
        }

        if (
          behavior.joinClass &&
          behavior.joinClass !== player.baseClass &&
          player.baseClass === BaseClass.Traveller
        ) {
          env?.callbacks.emit({
            type: GameServerResponse.SendConfirm,
            title: `Join the ${behavior.joinClass} Brotherhood?`,
            content: `I cannot train you unless you join the ${behavior.joinClass} brotherhood, ${player.name}. Would you like to join us?`,
            extraData: {
              npcSprite: npc.sprite,
              okText: 'Yes, join!',
              cancelText: 'No, I need to think more',
            },
            okAction: { command: '!privatesay', args: `${npc.uuid}, join` },
          });

          return `I cannot currently train you, but would you like to JOIN the ${behavior.joinClass} brotherhood?`;
        }

        if (
          player.baseClass !== BaseClass.Traveller &&
          !behavior.trainClass.includes(player.baseClass)
        ) {
          const options = [{ text: 'Leave', action: 'noop' }];

          if (this.canRevive) {
            options.unshift({ text: 'Can you cleanse me?', action: 'cleanse' });
            options.unshift({ text: 'Can you recall me?', action: 'recall' });
          }

          const formattedChat: IDialogChatAction = {
            message: `I cannot train you, ${player.name}.`,
            displayTitle: npc.name,
            displayNPCName: npc.name,
            displayNPCSprite: npc.sprite,
            displayNPCUUID: npc.uuid,
            options,
          };

          game.transmissionHelper.sendResponseToAccount(
            player.username,
            GameServerResponse.DialogChat,
            formattedChat,
          );

          return `I cannot train you, ${player.name}.`;
        }

        env?.callbacks.emit({
          action: GameAction.NPCActionShowTrainer,
          npcUUID: npc.uuid,
          npcName: npc.name,
          npcSprite: npc.sprite,
          npcMaxLevel: maxLevelUpLevel,
          npcMaxSkill: maxSkillTrain,
          npcCanRevive: this.canRevive,
          npcGuildTeleport: this.hasGuild,
        });

        return `Hello, ${env?.player.name}!`;
      });

    parser
      .addCommand('join')
      .setSyntax(['join'])
      .setLogic(async ({ env }) => {
        const player = env?.player;

        if (distanceFrom(player, npc) > 0) return 'Please come closer.';

        if (!behavior.joinClass) {
          return `I have no brotherhood for you, ${player.name}.`;
        }
        if (player.baseClass !== BaseClass.Traveller) {
          return 'You seem to have made a choice already.';
        }

        game.playerHelper.becomeClass(player, behavior.joinClass);

        env?.callbacks.emit({
          type: GameServerResponse.SendAlert,
          title: `Welcome, New ${behavior.joinClass}`,
          content: `Welcome to the ${behavior.joinClass} brotherhood, ${player.name}.`,
          extraData: { npcSprite: npc.sprite },
        });

        return `Welcome to the ${behavior.joinClass} brotherhood, ${player.name}.`;
      });

    parser
      .addCommand('assess')
      .setSyntax(['assess <string:skill*>'])
      .setLogic(async ({ env, args }) => {
        const player = env?.player;
        const skill = args['skill*'].toLowerCase();

        const checkSkill = Object.values(Skill).includes(skill);
        if (!checkSkill) return 'Hmm, what is that? A new kind of skill?';

        const ignores = settingClassConfigGet<'noTrainSkills'>(
          player.baseClass,
          'noTrainSkills',
        );

        if ((ignores || []).includes(skill)) {
          return "I'm afraid I can't help you with that skill.";
        }

        const skillLevel = calcSkillLevelForCharacter(player, skill);
        if (skillLevel > maxSkillTrain) {
          return "You're way beyond my comprehension.";
        }

        const assessCost =
          settingGameGet('npcscript', 'trainer.assessCost') ?? 50;
        if (!hasCurrency(player, assessCost)) {
          return `You do need to pay for this, you know. ${assessCost} gold is not a lot!`;
        }

        loseCurrency(player, assessCost);

        const percentWay = assessPercentToNextSkill(player, skill);

        return `You're ${percentWay}% of the way to your next ${skill.toUpperCase()} skill level.`;
      });

    parser
      .addCommand('trainskill')
      .setSyntax(['trainskill <string:skill*>'])
      .setLogic(async ({ env, args }) => {
        const player = env?.player;
        const skill = args['skill*'].toLowerCase();

        const checkSkill = Object.values(Skill).includes(skill);
        if (!checkSkill) return 'Hmm, what is that? A new kind of skill?';

        const ignores = settingClassConfigGet<'noTrainSkills'>(
          player.baseClass,
          'noTrainSkills',
        );

        if ((ignores || []).includes(skill)) {
          return "I'm afraid I can't help you with that skill.";
        }

        const skillLevel = calcSkillLevelForCharacter(player, skill);
        if (skillLevel > maxSkillTrain) {
          return "You're way beyond my comprehension.";
        }

        const rightHand = player.items.equipment[ItemSlot.RightHand];
        if (!rightHand) return 'You need to hold coins in your right hand!';
        if (rightHand.name !== 'Gold Coin') {
          return 'You need to hold coins in your right hand!';
        }

        // you can only spend as much as the trainer can train to
        const heldValue = rightHand.mods.value || 1;
        const maxCoins = calculateSkillXPRequiredForLevel(maxSkillTrain);
        const curValue = player.skills[skill] || 0;
        const curTrain = player.paidSkills[skill] || 0;

        const totalCost = maxCoins - curValue - curTrain;
        const costMult =
          settingGameGet('character', 'trainingCostGoldMultiplier') ?? 1;
        const totalCostWithMult = Math.floor(totalCost * costMult);

        const coinsTaken = Math.floor(
          Math.max(0, Math.min(heldValue, totalCostWithMult)),
        );

        const skillTrainingGained = Math.floor(coinsTaken / costMult);

        if (coinsTaken <= 0) return 'I cannot train you any more!';
        if (isNaN(coinsTaken) || !coinsTaken) {
          return 'I cannot train you for some reason!';
        }

        game.playerHelper.trainSkill(player, skill, skillTrainingGained);

        // gain 1/10 of the gold as exp
        let expGained = 1;
        if (player.level < maxLevelUpLevel) {
          expGained = Math.floor(coinsTaken / 10);
          if (expGained < 1) expGained = 1;

          if (isNaN(expGained)) expGained = 1;
        }

        game.playerHelper.gainExp(player, expGained);

        // if we ran out of gold, banish it
        rightHand.mods.value -= coinsTaken;
        if (rightHand.mods.value <= 0) {
          game.characterHelper.setRightHand(player, undefined);
        }

        return 'I hope the training pays off!';
      });

    parser
      .addCommand('train')
      .setSyntax(['train'])
      .setLogic(async ({ env }) => {
        const player: Player = env?.player;

        if (distanceFrom(player, npc) > 0) return 'Please come closer.';
        if (
          player.baseClass !== BaseClass.Traveller &&
          !behavior.trainClass.includes(player.baseClass)
        ) {
          return 'I cannot train you.';
        }
        if (player.gainingAXP) {
          return 'You seem to be training with the ancient arts at present.';
        }

        const trainCost =
          settingGameGet('npcscript', 'trainer.trainCost') ?? 200;
        if (!hasCurrency(player, trainCost)) {
          return `You do need to pay for this, you know. ${trainCost} gold is not a lot!`;
        }

        if (player.level >= maxLevelUpLevel) {
          return 'You are too advanced for my teachings.';
        }

        const oldLevel = player.level;
        game.playerHelper.tryLevelUp(player, maxLevelUpLevel);
        const newLevel = player.level;

        if (oldLevel === newLevel) {
          return 'You are not experienced enough to train with me.';
        }

        loseCurrency(player, trainCost);

        return `You've gained ${newLevel - oldLevel} experience levels, and ${(newLevel - oldLevel) * 1} trait point(s).`;
      });

    parser
      .addCommand('ancient')
      .setSyntax(['ancient'])
      .setLogic(async ({ env }) => {
        const player: Player = env?.player;

        if (distanceFrom(player, npc) > 0) return 'Please come closer.';
        if (
          player.baseClass !== BaseClass.Traveller &&
          !behavior.trainClass.includes(player.baseClass)
        ) {
          return 'I cannot train you.';
        }
        if (!player.gainingAXP) {
          return 'You do not seem to be training with the ancient arts at present.';
        }

        if (!hasCurrency(player, 50000)) {
          return 'You do need to pay for this, you know. 50,000 gold is not a lot!';
        }

        if (player.level < 50) return 'You are not ready for my teachings.';

        const oldLevel = player.traits.ap;
        game.playerHelper.tryAncientLevelUp(player);
        const newLevel = player.traits.ap;

        if (oldLevel === newLevel) {
          return 'You are not experienced enough to train with me.';
        }

        loseCurrency(player, 50000);

        return `You've gained ${newLevel - oldLevel} ancient level(s).`;
      });

    if (this.canRevive) {
      parser
        .addCommand('cleanse')
        .setSyntax(['cleanse'])
        .setLogic(async ({ env }) => {
          const player = env?.player;

          game.commandHandler.getSkillRef('Cleanse').use(undefined, player);

          env?.callbacks.emit({
            type: GameServerResponse.SendAlert,
            title: 'Cleansed',
            content: `You're now cleansed, ${player.name}. May Maer be with you.`,
            extraData: { npcSprite: npc.sprite },
          });

          return `You're now cleansed, ${player.name}. May Maer be with you.`;
        });

      parser
        .addCommand('recall')
        .setSyntax(['recall'])
        .setLogic(async ({ env }) => {
          const player = env?.player;

          const mapData = game.worldManager.getMap(npc.map);
          const recallDisabled = mapData?.map.properties.respawnKick;

          if (recallDisabled) {
            env?.callbacks.emit({
              type: GameServerResponse.SendAlert,
              title: 'Unable to Recall',
              content: `I cannot recall you here, ${player.name}, the ether is too twisting.`,
              extraData: { npcSprite: npc.sprite },
            });

            return `I cannot recall you here, ${player.name}, the ether is too twisting.`;
          }

          env?.callbacks.emit({
            type: GameServerResponse.SendAlert,
            title: 'Respawn Point Set',
            content: `I'll bring you right back to me when you die, ${player.name}.`,
            extraData: { npcSprite: npc.sprite },
          });

          player.respawnPoint = { x: npc.x, y: npc.y, map: npc.map };

          return `I'll bring you right back to me when you die, ${player.name}.`;
        });
    }

    if (this.hasGuild) {
      parser
        .addCommand('guildteleport')
        .setSyntax(['guildteleport'])
        .setLogic(async ({ env }) => {
          const player = env?.player;

          const mapData = game.worldManager.getMap(npc.map);
          const teleDisabled = mapData?.map.properties.respawnKick;

          if (teleDisabled) {
            env?.callbacks.emit({
              type: GameServerResponse.SendAlert,
              title: 'Unable to Teleport',
              content: `I cannot teleport you from here, ${player.name}, the ether is too twisting.`,
              extraData: { npcSprite: npc.sprite },
            });

            return `I cannot teleport you from here, ${player.name}, the ether is too twisting.`;
          }

          const teleportPoint = settingGameGet(
            'map',
            'defaultThievesGuild',
          ) ?? {
            map: 'ThievesGuild',
            x: 15,
            y: 15,
          };

          if (player.map === teleportPoint.map) {
            game.teleportHelper.teleport(player, {
              map: player.respawnPoint.map,
              x: player.respawnPoint.x,
              y: player.respawnPoint.y,
            });
            return `See ya, ${player.name}.`;
          }

          game.teleportHelper.teleport(player, {
            map: teleportPoint.map,
            x: teleportPoint.x,
            y: teleportPoint.y,
          });

          return `See ya, ${player.name}.`;
        });
    }

    parser
      .addCommand('reset')
      .setSyntax(['reset'])
      .setLogic(async ({ env }) => {
        const player: Player = env?.player;

        if (distanceFrom(player, npc) > 0) return 'Please come closer.';

        if (player.level >= 30 && !player.subscriptionTier) {
          const resetCost =
            settingGameGet('npcscript', 'trainer.resetCost') ?? 10000;
          if (!hasCurrency(player, resetCost)) {
            return `You do need to pay for this, you know. ${resetCost} gold is not a lot!`;
          }
          loseCurrency(player, resetCost);
        }

        game.traitHelper.resetTraits(player);

        return 'Your traits have been reset.';
      });
  }

  tick(game: Game, npc: INPC) {
    if (!this.canRevive) return;

    const mapData = game.worldManager.getMap(npc.map);
    const recallDisabled = mapData?.map.properties.respawnKick;
    if (recallDisabled) return;

    const corpses = game.groundManager.getItemsFromGround(
      npc.map,
      npc.x,
      npc.y,
      ItemClass.Corpse,
    );
    corpses.forEach((corpse) => {
      if (!corpse.item.mods.corpseUsername) return;

      const player = game.playerManager.getPlayerByUsername(
        corpse.item.mods.corpseUsername,
      );
      if (!player) return;

      game.messageHelper.sendSimpleMessage(player, `${npc.name} revived you!`);

      game.deathHelper.restore(player, { map: npc.map, x: npc.x, y: npc.y });
      game.characterHelper.gainPermanentStat(player, Stat.CON, 1);
    });
  }
}
