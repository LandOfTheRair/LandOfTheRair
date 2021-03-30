import { Parser } from 'muud';
import { Game } from '../../../../helpers';
import { BaseClass, GameAction, GameServerResponse, IAIBehavior,
  INPC, IPlayer, ItemClass, ItemSlot, ITrainerBehavior, Skill, Stat } from '../../../../interfaces';
import { Player } from '../../../orm';

export class TrainerBehavior implements IAIBehavior {

  private canRevive = false;

  init(game: Game, npc: INPC, parser: Parser, behavior: ITrainerBehavior) {

    this.canRevive = behavior.trainClass.includes(BaseClass.Healer);

    const { maxLevelUpLevel, maxSkillTrain } = behavior;

    if (!maxLevelUpLevel || !maxSkillTrain) {
      game.logger.error('Behavior:Trainer', `NPC at ${npc.map}-${npc.x},${npc.y} has invalid levelup/skillup settings.`);
      return;
    }

    // default guidance
    parser.addCommand('hello')
      .setSyntax(['hello'])
      .setLogic(async ({ env }) => {

        const player: IPlayer = env?.player;
        if (!player) return 'You seem strange.';

        if (game.directionHelper.distFrom(player, npc) > 0) return 'Please come closer.';

        if (behavior.joinClass && player.baseClass === BaseClass.Traveller) {
          env?.callbacks.emit({
            type: GameServerResponse.SendConfirm,
            title: `Join the ${behavior.joinClass} Brotherhood?`,
            content: `I cannot train you unless you join the ${behavior.joinClass} brotherhood, ${player.name}. Would you like to join us?`,
            extraData: { npcSprite: npc.sprite, okText: 'Yes, join!', cancelText: 'No, I need to think more' },
            okAction: { command: '!privatesay', args: `${npc.uuid}, join` }
          });

          return `I cannot currently train you, but would you like to JOIN the ${behavior.joinClass} brotherhood?`;
        }

        if (player.baseClass !== BaseClass.Traveller && !behavior.trainClass.includes(player.baseClass)) {
          env?.callbacks.emit({
            type: GameServerResponse.SendAlert,
            title: 'Not Trainable',
            content: `I cannot train you, ${player.name}.`,
            extraData: { npcSprite: npc.sprite },
          });

          return `I cannot train you, ${player.name}.`;
        }

        env?.callbacks.emit({
          action: GameAction.NPCActionShowTrainer,
          npcUUID: npc.uuid,
          npcName: npc.name,
          npcSprite: npc.sprite,
          npcMaxLevel: maxLevelUpLevel,
          npcMaxSkill: maxSkillTrain
        });

        return `Hello, ${env?.player.name}!`;
      });

    parser.addCommand('join')
      .setSyntax(['join'])
      .setLogic(async ({ env }) => {
        const player = env?.player;

        if (game.directionHelper.distFrom(player, npc) > 0) return 'Please come closer.';

        if (!behavior.joinClass) return `I have no brotherhood for you, ${player.name}.`;
        if (player.baseClass !== BaseClass.Traveller) return 'You seem to have made a choice already.';

        game.playerHelper.becomeClass(player, behavior.joinClass);

        env?.callbacks.emit({
          type: GameServerResponse.SendAlert,
          title: `Welcome, New ${behavior.joinClass}`,
          content: `Welcome to the ${behavior.joinClass} brotherhood, ${player.name}.`,
          extraData: { npcSprite: npc.sprite },
        });

        return `Welcome to the ${behavior.joinClass} brotherhood, ${player.name}.`;
      });

    parser.addCommand('assess')
      .setSyntax(['assess <string:skill*>'])
      .setLogic(async ({ env, args }) => {
        const player = env?.player;
        const skill = args['skill*'].toLowerCase();

        const checkSkill = Object.values(Skill).includes(skill);
        if (!checkSkill) return 'Hmm, what is that? A new kind of skill?';

        const ignores = {
          [BaseClass.Warrior]:    [Skill.Wand, Skill.Restoration, Skill.Thievery, Skill.Conjuration],
          [BaseClass.Mage]:       [Skill.Restoration, Skill.Thievery],
          [BaseClass.Healer]:     [Skill.Thievery, Skill.Conjuration],
          [BaseClass.Thief]:      [Skill.Wand, Skill.Restoration, Skill.Conjuration]
        };

        if ((ignores[behavior.joinClass] || []).includes(skill)) return 'I\'m afraid I can\'t help you with that skill.';

        const skillLevel = game.calculatorHelper.calcSkillLevelForCharacter(player, skill);
        if (skillLevel > maxSkillTrain) return 'You\'re way beyond my comprehension.';

        if (!game.currencyHelper.hasCurrency(player, 50)) return 'You do need to pay for this, you know. 50 gold is not a lot!';
        game.currencyHelper.loseCurrency(player, 50);

        const percentWay = game.calculatorHelper.assessPercentToNextSkill(player, skill);

        return `You're ${percentWay}% of the way to your next ${skill.toUpperCase()} skill level.`;
      });

    parser.addCommand('trainskill')
      .setSyntax(['trainskill <string:skill*>'])
      .setLogic(async ({ env, args }) => {
        const player = env?.player;
        const skill = args['skill*'].toLowerCase();

        const checkSkill = Object.values(Skill).includes(skill);
        if (!checkSkill) return 'Hmm, what is that? A new kind of skill?';

        const ignores = {
          [BaseClass.Warrior]:    [Skill.Wand, Skill.Restoration, Skill.Conjuration],
          [BaseClass.Mage]:       [Skill.Restoration],
          [BaseClass.Healer]:     [Skill.Conjuration],
          [BaseClass.Thief]:      [Skill.Wand, Skill.Restoration, Skill.Conjuration]
        };

        if ((ignores[behavior.joinClass] || []).includes(skill)) return 'I\'m afraid I can\'t help you with that skill.';

        const skillLevel = game.calculatorHelper.calcSkillLevelForCharacter(player, skill);
        if (skillLevel > maxSkillTrain) return 'You\'re way beyond my comprehension.';

        const rightHand = player.items.equipment[ItemSlot.RightHand];
        if (!rightHand) return 'You need to hold coins in your right hand!';
        if (rightHand.name !== 'Gold Coin') return 'You need to hold coins in your right hand!';

        // you can only spend as much as the trainer can train to
        const heldValue = rightHand.mods.value ?? 1;
        const maxCoins = game.calculatorHelper.calculateSkillXPRequiredForLevel(maxSkillTrain);
        const curValue = player.skills[skill] ?? 0;
        const curTrain = player.paidSkills[skill] ?? 0;

        const coinsTaken = Math.floor(Math.max(0, Math.min(heldValue, maxCoins - curValue - curTrain)));

        if (coinsTaken <= 0) return 'I cannot train you any more!';

        game.playerHelper.trainSkill(player, skill, coinsTaken);

        // gain 1/10 of the gold as exp
        let expGained = 1;
        if (game.playerHelper.canGainExpOnMap(player)) {
          expGained = Math.floor(coinsTaken / 10);
          if (expGained < 1) expGained = 1;
        }

        game.playerHelper.gainExp(player, expGained);

        // if we ran out of gold, banish it
        rightHand.mods.value -= coinsTaken;
        if (rightHand.mods.value <= 0) {
          game.characterHelper.setRightHand(player, undefined);
        }

        return 'I hope the training pays off!';
      });

    parser.addCommand('train')
      .setSyntax(['train'])
      .setLogic(async ({ env }) => {
        const player: Player = env?.player;

        if (game.directionHelper.distFrom(player, npc) > 0) return 'Please come closer.';
        if (player.baseClass !== BaseClass.Traveller && !behavior.trainClass.includes(player.baseClass)) return 'I cannot train you.';
        if (player.gainingAXP) return 'You seem to be training with the ancient arts at present.';

        if (!game.currencyHelper.hasCurrency(player, 200)) return 'You do need to pay for this, you know. 200 gold is not a lot!';

        if (player.level >= maxLevelUpLevel) return 'You are too advanced for my teachings.';

        const oldLevel = player.level;
        game.playerHelper.tryLevelUp(player, maxLevelUpLevel);
        const newLevel = player.level;

        if (oldLevel === newLevel) return 'You are not experienced enough to train with me.';

        game.currencyHelper.loseCurrency(player, 200);

        return `You have gained ${newLevel - oldLevel} experience levels, and ${(newLevel - oldLevel) * 1} trait point(s).`;
      });

    if (this.canRevive) {
      parser.addCommand('recall')
        .setSyntax(['recall'])
        .setLogic(async ({ env }) => {
          const player = env?.player;

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

    parser.addCommand('reset')
      .setSyntax(['reset'])
      .setLogic(async ({ env }) => {
        const player: Player = env?.player;

        if (game.directionHelper.distFrom(player, npc) > 0) return 'Please come closer.';

        game.traitHelper.resetTraits(player);

        return 'Your traits have been reset.';
      });
  }

  tick(game: Game, npc: INPC) {
    if (!this.canRevive) return;

    const corpses = game.groundManager.getItemsFromGround(npc.map, npc.x, npc.y, ItemClass.Corpse);
    corpses.forEach(corpse => {
      if (!corpse.item.mods.corpseUsername) return;

      const player = game.playerManager.getPlayerByUsername(corpse.item.mods.corpseUsername);
      if (!player) return;

      game.deathHelper.restore(player, { map: npc.map, x: npc.x, y: npc.y });
      game.characterHelper.gainPermanentStat(player, Stat.CON, 1);

      game.messageHelper.sendSimpleMessage(player, `${npc.name} revived you!`);
    });
  }
}
