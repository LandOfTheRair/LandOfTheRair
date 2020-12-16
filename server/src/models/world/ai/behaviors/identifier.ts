import { random, sample } from 'lodash';
import { Parser } from 'muud';

import { Game } from '../../../../helpers';
import { Currency, descTextFor, GameServerResponse, IAIBehavior, IIdentifierBehavior, INPC, IPlayer, ItemSlot, MessageType } from '../../../../interfaces';

export class IdentifierBehavior implements IAIBehavior {

  private messages: string[] = [];
  private lastMessageShouted = '';
  private ticksForNextMessage = 0;

  init(game: Game, npc: INPC, parser: Parser, behavior: IIdentifierBehavior) {

    let { identifyCurrency, identifyCost, identifyTier } = behavior;

    identifyCurrency ??= Currency.Gold;
    identifyCost ??= 1000;
    identifyTier ??= 0;

    this.messages = [
      `I ask only ${identifyCost.toLocaleString()} ${identifyCurrency}, to help my poor children!`,
      `${identifyCost.toLocaleString()} ${identifyCurrency} for the best identify service in town!`,
      `${identifyCost.toLocaleString()} ${identifyCurrency} to identify your items!`,
      `Identify services going for ${identifyCost.toLocaleString()} ${identifyCurrency}!`
    ];

    parser.addCommand('hello')
      .setSyntax(['hello'])
      .setLogic(async ({ env }) => {
        const player = env?.player;
        if (!player) return 'You do not exist.';

        if (game.directionHelper.distFrom(player, npc) > 2) return 'Please come closer.';

        env?.callbacks.emit({
          type: GameServerResponse.SendConfirm,
          title: `Identify Item?`,
          content: `Would you like to identify the item in your right hand for ${identifyCost.toLocaleString()} ${identifyCurrency}?`,
          extraData: { npcSprite: npc.sprite, okText: 'Yes, identify!', cancelText: 'No, not now' },
          okAction: { command: `!privatesay`, args: `${npc.uuid}, identify` }
        });

        return `Hello, ${player.name}! Would you like to IDENTIFY the item in your right hand for ${identifyCost.toLocaleString()} ${identifyCurrency}?`;
      });

    parser.addCommand('identify')
      .setSyntax(['identify'])
      .setLogic(async ({ env }) => {
        const player: IPlayer = env?.player;
        if (!player) return 'You do not exist.';

        if (game.directionHelper.distFrom(player, npc) > 2) return 'Please come closer.';

        const rightHand = player.items.equipment[ItemSlot.RightHand];
        if (!rightHand) return 'You do not have anything in your right hand!';
        if (!game.characterHelper.hasCurrency(player, identifyCost, identifyCurrency)) return `You do not have enough ${identifyCurrency} for that!`;

        game.characterHelper.loseCurrency(player, identifyCost, identifyCurrency);

        const identMsg = descTextFor(
          player,
          rightHand,
          game.itemHelper.getItemDefinition(rightHand.name),
          rightHand.mods?.encrustItem ? game.itemHelper.getItemDefinition(rightHand.mods.encrustItem) : undefined,
          identifyTier
        );

        env?.callbacks.emit({
          type: GameServerResponse.SendAlert,
          title: `Identify`,
          content: identMsg,
          extraData: { itemName: rightHand.name },
        });

        game.messageHelper.sendSimpleMessage(player, identMsg);

        return `Thanks, ${player.name}!`;
      });
  }

  tick(game: Game, npc: INPC) {
    if (this.ticksForNextMessage > 0) {
      this.ticksForNextMessage--;
      return;
    }

    this.ticksForNextMessage = random(15, 30);
    const nextMessage = sample(this.messages.filter(x => x !== this.lastMessageShouted));
    this.lastMessageShouted = nextMessage;

    game.messageHelper.sendLogMessageToRadius(npc, 8, { message: nextMessage, from: npc.name }, [MessageType.NPCChatter]);
  }
}
