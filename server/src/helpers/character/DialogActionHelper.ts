import { Injectable } from 'injection-js';
import { sample, template } from 'lodash';

import { GameServerResponse, IDialogAction, IDialogActionType,
  IDialogChatAction, IDialogChatActionOption, IDialogCheckItemAction,
  IDialogCheckQuestAction,
  IDialogGiveEffectAction,
  IDialogGiveItemAction, IDialogGiveQuestAction, IDialogRequirement, IDialogTakeItemAction, INPC,
  IPlayer, ItemSlot, MessageType, Stat } from '../../interfaces';
import { BaseService } from '../../models/BaseService';

interface IActionResult {
  messages: string[];
  shouldContinue: boolean;
}

@Injectable()
export class DialogActionHelper extends BaseService {

  public init() {}

  public async handleDialog(player: IPlayer, npc: INPC, command: string, callbacks): Promise<void> {
    const messages = await (npc as any).dialogParser.parse(command, { player, callbacks }) || [];
    if ((messages || []).length === 0) {
      messages.push(this.getDefaultMessage());
    }
    (messages || []).forEach(message => {
      this.game.messageHelper.sendLogMessageToPlayer(player, { message, from: npc.name }, [MessageType.NPCChatter]);
    });
  }

  public handleAction(action: IDialogAction, npc: INPC, player: IPlayer): IActionResult {

    const actions: Record<IDialogActionType, (act, npc, player) => IActionResult> = {
      [IDialogActionType.Chat]:         this.handleChatAction,
      [IDialogActionType.CheckItem]:    this.handleCheckItemAction,
      [IDialogActionType.TakeItem]:     this.handleTakeItemAction,
      [IDialogActionType.GiveItem]:     this.handleGiveItemAction,
      [IDialogActionType.GiveEffect]:   this.handleGiveEffectAction,
      [IDialogActionType.CheckQuest]:   this.handleCheckQuestAction,
      [IDialogActionType.GiveQuest]:    this.handleGiveQuestAction
    };

    return actions[action.type].bind(this)(action, npc, player);
  }

  private getDefaultMessage() {
    const defaultMessages = [
      'Hmm?',
      'What do you mean?',
      'Hello, are you looking for me?',
      'What do you want with me?',
      'Did you mean to say something else?',
      'What did you just call me?',
      'Can you get to the point of the matter?',
      'I\'m very busy, can you hurry it up?',
      'Can you be more clear?'
    ];

    return sample(defaultMessages);
  }

  private handleChatAction(action: IDialogChatAction, npc: INPC, player: IPlayer): IActionResult {

    const maxDistance = action.maxDistance ?? 3;
    if (this.game.directionHelper.distFrom(player, npc) > maxDistance) {
      return { messages: ['Please come closer.'], shouldContinue: false };
    }

    const formattedChat: IDialogChatAction = {
      message: template(action.message)(player),
      displayTitle: npc.name,
      displayNPCName: npc.name,
      displayNPCSprite: npc.sprite,
      displayNPCUUID: npc.uuid,
      options: action.options
        .map(x => {
          if (x.requirement && !this.meetsRequirement(player, x.requirement)) return null;
          return {
            text: template(x.text)(player),
            action: x.action
          };
        })
        .filter(Boolean) as IDialogChatActionOption[]
    };

    this.game.transmissionHelper.sendResponseToAccount(player.username, GameServerResponse.DialogChat, formattedChat);

    return { messages: [formattedChat.message], shouldContinue: true };
  }

  private handleCheckItemAction(action: IDialogCheckItemAction, npc: INPC, player: IPlayer): IActionResult {
    const { slot, item, fromHands, checkPassActions, checkFailActions } = action;

    const retMessages: string[] = [];

    let didSucceed = false;

    if (fromHands) {
      (slot || []).forEach(checkSlot => {
        const slotItem = player.items.equipment[checkSlot];
        if (!slotItem) return;

        const { name, owner } = item;
        if (slotItem.name !== name) return;
        if (owner && slotItem.mods.owner !== player.username) {
          retMessages.push('Hey! You need to bring me an item owned by you.');
          return;
        }

        didSucceed = true;
      });
    }

    const actions = didSucceed ? checkPassActions : checkFailActions;

    for (const subAction of actions) {
      const { messages, shouldContinue } = this.handleAction(subAction, npc, player);
      retMessages.push(...messages);

      if (!shouldContinue) return { messages: retMessages, shouldContinue: false };
    }

    return { messages: retMessages, shouldContinue: true };
  }

  private handleTakeItemAction(action: IDialogTakeItemAction, npc: INPC, player: IPlayer): IActionResult {
    const { slot, item } = action;

    let didSucceed = false;

    (slot || []).forEach(checkSlot => {
      const slotItem = player.items.equipment[checkSlot];
      if (!slotItem) return;

      const { name, owner } = item;
      if (slotItem.name !== name) return;
      if (owner && slotItem.mods.owner !== player.username) return;

      this.game.characterHelper.setEquipmentSlot(player, checkSlot as ItemSlot, undefined);

      didSucceed = true;
    });

    const messages: string[] = [];
    if (!didSucceed) messages.push('Hey! You need to bring me an item owned by you.');

    return { messages, shouldContinue: didSucceed };
  }

  private handleGiveItemAction(action: IDialogGiveItemAction, npc: INPC, player: IPlayer): IActionResult {
    const { slot, item } = action;

    let didSucceed = false;

    (slot || []).forEach(checkSlot => {
      const slotItem = player.items.equipment[checkSlot];
      if (slotItem) return;

      const simpleItem = this.game.itemCreator.getSimpleItem(item.name);
      this.game.characterHelper.setEquipmentSlot(player, checkSlot as ItemSlot, simpleItem);

      didSucceed = true;
    });

    return { messages: [], shouldContinue: didSucceed };
  }

  private handleGiveEffectAction(action: IDialogGiveEffectAction, npc: INPC, player: IPlayer): IActionResult {

    const { effect, duration } = action;

    this.game.effectHelper.addEffect(player, npc, effect, { effect: { duration } });

    return { messages: [], shouldContinue: true };
  }

  private handleCheckQuestAction(action: IDialogCheckQuestAction, npc: INPC, player: IPlayer): IActionResult {

    const maxDistance = action.maxDistance ?? 3;
    if (this.game.directionHelper.distFrom(player, npc) > maxDistance) {
      return { messages: ['Please come closer.'], shouldContinue: false };
    }

    const { quest } = action;
    const questRef = this.game.questHelper.getQuest(quest);

    if (!questRef) {
      this.game.logger.error('DialogActionHelper:GiveQuest', `Quest ${quest} does not exist.`);
      return { messages: ['That quest does not exist at this time.'], shouldContinue: true };
    }

    // if we don't have the quest, we skip - dialog continues
    if (!this.game.questHelper.hasQuest(player, quest)) return { messages: [], shouldContinue: true };

    // if we have the quest and it's complete, we send completion, and give rewards
    if (this.game.questHelper.isQuestComplete(player, quest)) {
      const compMsg = this.game.questHelper.formatQuestMessage(player, quest, questRef.messages.complete || `You've completed the quest "${quest}".`);
      this.game.questHelper.completeQuest(player, quest);

      return { messages: [compMsg], shouldContinue: false };
    }


    // should continue is false if we have the quest and it's incomplete
    // check if quest not complete, if not, send incomplete message
    // if complete, do complete

    return { messages: [
      this.game.questHelper.formatQuestMessage(player, quest, questRef.messages.incomplete || `You're not done with this quest yet.`)
    ], shouldContinue: false };
  }

  private handleGiveQuestAction(action: IDialogGiveQuestAction, npc: INPC, player: IPlayer): IActionResult {

    const maxDistance = action.maxDistance ?? 3;
    if (this.game.directionHelper.distFrom(player, npc) > maxDistance) {
      return { messages: ['Please come closer.'], shouldContinue: false };
    }

    const { quest } = action;
    const questRef = this.game.questHelper.getQuest(quest);

    if (!questRef) {
      this.game.logger.error('DialogActionHelper:GiveQuest', `Quest ${quest} does not exist.`);
      return { messages: ['That quest does not exist at this time.'], shouldContinue: true };
    }

    if (!this.game.questHelper.canStartQuest(player, quest)) {
      return { messages: [
        this.game.questHelper.formatQuestMessage(player, quest, questRef.messages.permComplete || 'You already completed that quest!')
      ], shouldContinue: false };
    }

    if (this.game.questHelper.hasQuest(player, quest)) {
      return { messages: [
        this.game.questHelper.formatQuestMessage(player, quest, questRef.messages.alreadyHas || 'You are already on that quest!')
      ], shouldContinue: true };
    }

    this.game.questHelper.startQuest(player, quest);

    return { messages: [`You've accepted the quest "${quest}".`], shouldContinue: true };
  }

  private meetsRequirement(player: IPlayer, requirement: IDialogRequirement): boolean {
    if (requirement.stat && requirement.statValue) {
      const stat = this.game.characterHelper.getStat(player, requirement.stat as Stat);
      if (stat < requirement.statValue) return false;
    }

    return true;
  }
}
