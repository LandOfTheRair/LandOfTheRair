import { Parser } from 'muud';
import { Game } from '../../../../helpers';
import { BaseClass, GameAction, GameServerResponse, IAIBehavior, INPC, IPlayer, ITrainerBehavior, Skill } from '../../../../interfaces';

export class TrainerBehavior implements IAIBehavior {

  init(game: Game, npc: INPC, parser: Parser, behavior: ITrainerBehavior, props = {}) {

    // default guidance
    parser.addCommand('hello')
      .setSyntax(['hello'])
      .setLogic(async ({ env }) => {

        const player: IPlayer = env?.player;
        if (!player) return 'You seem strange.';

        if (game.directionHelper.distFrom(player, npc) > 0) return 'Please come closer.';

        if (behavior.joinClass && player.baseClass === BaseClass.Undecided) {
          env?.callbacks.emit({
            type: GameServerResponse.SendConfirm,
            title: `Join the ${behavior.joinClass} Brotherhood?`,
            content: `I cannot train you unless you join the ${behavior.joinClass} brotherhood, ${player.name}. Would you like to join us?`,
            okAction: { command: `!privatesay`, args: `${npc.uuid}, join` }
          });

          return `I cannot currently train you, but would you like to JOIN the ${behavior.joinClass} brotherhood?`;
        }

        if (player.baseClass !== BaseClass.Undecided && !behavior.trainClass.includes(player.baseClass)) {
          env?.callbacks.emit({
            type: GameServerResponse.SendAlert,
            title: 'Not Trainable',
            content: `I cannot train you, ${player.name}.`
          });

          return `I cannot train you, ${player.name}.`;
        }

        env?.callbacks.emit({
          action: GameAction.NPCActionShowTrainer,
          npcUUID: npc.uuid,
          npcName: npc.name,
          npcSprite: npc.sprite,
          trainClasses: behavior.trainClass
        });

        return `Hello, ${env?.player.name}!`;
      });

    parser.addCommand('join')
      .setSyntax(['join'])
      .setLogic(async ({ env }) => {
        const player = env?.player;

        if (game.directionHelper.distFrom(player, npc) > 0) return 'Please come closer.';

        if (!behavior.joinClass) return `I have no brotherhood for you, ${player.name}.`;
        if (player.baseClass !== BaseClass.Undecided) return `You seem to have made a choice already.`;

        game.playerHelper.becomeClass(player, behavior.joinClass);

        env?.callbacks.emit({
          type: GameServerResponse.SendAlert,
          title: `Welcome, New ${behavior.joinClass}`,
          content: `Welcome to the ${behavior.joinClass} brotherhood, ${player.name}.`
        });

        return `Welcome to the ${behavior.joinClass} brotherhood, ${player.name}.`;
      });

    parser.addCommand('assess')
      .setSyntax(['assess <string:skill*>'])
      .setLogic(async ({ env, args }) => {
        const player = env?.player;
        const skill = args['skill*'];

        const checkSkill = Skill[skill];
        if (!checkSkill) return 'Hmm, what is that? A new kind of skill?';

        const ignores = {
          [BaseClass.Warrior]:    [Skill.Restoration, Skill.Thievery, Skill.Conjuration],
          [BaseClass.Mage]:       [Skill.Restoration, Skill.Thievery],
          [BaseClass.Healer]:     [Skill.Thievery, Skill.Conjuration],
          [BaseClass.Thief]:      [Skill.Restoration, Skill.Conjuration]
        };

        if ((ignores[behavior.joinClass] || []).includes(checkSkill)) return 'I\'m afraid I can\'t help you with that skill.';

        if (!game.playerHelper.hasCurrency(player, 50)) return `You do need to pay for this, you know. 50 gold is not a lot!`;
        game.playerHelper.loseCurrency(player, 50);

        const percentWay = game.calculatorHelper.assessPercentToNextSkill(player, checkSkill);

        return `You're ${percentWay}% of the way to your next ${checkSkill.toUpperCase()} skill level.`;
      });

    parser.addCommand('train')
      .setSyntax(['train'])
      .setLogic(async ({ env }) => {
        const player = env?.player;
        return `Maybe one day you'll be able to level up, ${player.name}.`;
      });
  }

  tick() {}
}
