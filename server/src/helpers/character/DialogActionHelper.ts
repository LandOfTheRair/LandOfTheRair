import { Injectable } from 'injection-js';
import { sample, template } from 'lodash';

import { DialogActionType, GameServerResponse, IDialogAction,
  IDialogAddItemUpgradeAction,
  IDialogChatAction, IDialogChatActionOption, IDialogCheckAlignmentAction,
  IDialogCheckItemAction, IDialogCheckDailyQuestAction,
  IDialogCheckItemCanUpgradeAction, IDialogCheckNoItemAction,
  IDialogCheckLevelAction, IDialogGiveDailyQuestAction,
  IDialogCheckQuestAction, IDialogGiveEffectAction, IDialogGiveItemAction,
  IDialogGiveQuestAction, IDialogModifyItemAction, IDialogRequirement,
  IDialogSetAlignmentAction, IDialogTakeItemAction, INPC,
  IPlayer, ItemSlot, MessageType, Stat, TrackedStatistic,
  IDialogCheckNPCsAndDropItemsAction, ISimpleItem, Direction } from '../../interfaces';
import { BaseService } from '../../models/BaseService';

interface IActionResult {
  messages: string[];
  shouldContinue: boolean;
}

@Injectable()
export class DialogActionHelper extends BaseService {

  public init() {}

  public async handleDialog(player: IPlayer, npc: INPC, command: string, callbacks): Promise<void> {
    if (command === 'hello') {
      this.game.statisticsHelper.addStatistic(player, TrackedStatistic.NPCsGreeted);
    }

    const messages = await (npc as any).dialogParser.parse(command, { player, callbacks }) || [];
    if ((messages || []).length === 0) {
      messages.push(this.getDefaultMessage());
    }

    (messages || []).forEach(message => {
      this.game.messageHelper.sendLogMessageToPlayer(player, { message, from: npc.name }, [MessageType.NPCChatter]);
    });
  }

  public handleAction(action: IDialogAction, npc: INPC, player: IPlayer): IActionResult {

    const actions: Record<DialogActionType, (act, npc, player) => IActionResult> = {
      [DialogActionType.Chat]:                  this.handleChatAction,
      [DialogActionType.CheckItem]:             this.handleCheckItemAction,
      [DialogActionType.CheckNoItem]:           this.handleCheckNoItemAction,
      [DialogActionType.TakeItem]:              this.handleTakeItemAction,
      [DialogActionType.GiveItem]:              this.handleGiveItemAction,
      [DialogActionType.MergeAndGiveItem]:      this.handleMergeGiveItemAction,
      [DialogActionType.ModifyItem]:            this.handleModifyItemAction,
      [DialogActionType.CheckItemCanUpgrade]:   this.handleItemCanUpgradeAction,
      [DialogActionType.AddUpgradeItem]:        this.handleAddItemUpgradeAction,
      [DialogActionType.GiveEffect]:            this.handleGiveEffectAction,
      [DialogActionType.CheckQuest]:            this.handleCheckQuestAction,
      [DialogActionType.CheckDailyQuest]:       this.handleCheckDailyQuestAction,
      [DialogActionType.GiveQuest]:             this.handleGiveQuestAction,
      [DialogActionType.GiveDailyQuest]:        this.handleGiveDailyQuestAction,
      [DialogActionType.CheckLevel]:            this.handleCheckLevelAction,
      [DialogActionType.CheckAlignment]:        this.handleCheckAlignmentAction,
      [DialogActionType.SetAlignment]:          this.handleSetAlignmentAction,
      [DialogActionType.CheckNPCsAndDropItems]: this.handleCheckNPCAction,
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

  // DO a generic chat w/ modal
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
      options: (action.options || [])
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

  // SET alignment via an action
  private handleSetAlignmentAction(action: IDialogSetAlignmentAction, npc: INPC, player: IPlayer): IActionResult {
    const { alignment } = action;

    player.alignment = alignment;

    return { messages: [], shouldContinue: true };
  }

  // CHECK alignment
  private handleCheckAlignmentAction(action: IDialogCheckAlignmentAction, npc: INPC, player: IPlayer): IActionResult {
    const { alignment, checkPassActions, checkFailActions } = action;

    const retMessages: string[] = [];

    const didSucceed = player.alignment === alignment;

    const actions = (didSucceed ? checkPassActions : checkFailActions) ?? [];

    for (const subAction of actions) {
      const { messages, shouldContinue } = this.handleAction(subAction, npc, player);
      retMessages.push(...messages);

      if (!shouldContinue) return { messages: retMessages, shouldContinue: false };
    }

    return { messages: retMessages, shouldContinue: true };
  }

  // CHECK the player level
  private handleCheckLevelAction(action: IDialogCheckLevelAction, npc: INPC, player: IPlayer): IActionResult {
    const { level, checkPassActions, checkFailActions } = action;

    const retMessages: string[] = [];

    const didSucceed = player.level >= level;

    const actions = (didSucceed ? checkPassActions : checkFailActions) || [];

    for (const subAction of actions) {
      const { messages, shouldContinue } = this.handleAction(subAction, npc, player);
      retMessages.push(...messages);

      if (!shouldContinue) return { messages: retMessages, shouldContinue: false };
    }

    return { messages: retMessages, shouldContinue: true };
  }

  // CHECK the item(s) the player is holding
  private handleCheckItemAction(action: IDialogCheckItemAction, npc: INPC, player: IPlayer): IActionResult {
    const { slot, item, fromHands, checkPassActions, checkFailActions } = action;

    const retMessages: string[] = [];

    let didSucceed = false;

    const { name } = item;
    const formattedName = template(name)(player);

    const matches = (itemName: string) => itemName.includes(formattedName);

    // if we check hands
    if (fromHands) {
      (slot || []).forEach(checkSlot => {
        if (didSucceed) return;

        const slotItem = player.items.equipment[checkSlot];
        if (!slotItem) return;

        if (!matches(slotItem.name)) return;
        if (!this.game.itemHelper.isOwnedBy(player, slotItem)) {
          retMessages.push('Hey! You need to bring me an item owned by you.');
          return;
        }

        didSucceed = true;
      });
    }

    // we do something different to take from sack
    if ((slot || [])[0] === 'sack') {
      const matchingItems = player.items.sack.items.filter(x => matches(x.name) && this.game.itemHelper.isOwnedBy(player, x));
      if (matchingItems.length >= (item.amount ?? 1)) {
        didSucceed = true;
      }
    }

    const actions = (didSucceed ? checkPassActions : checkFailActions) ?? [];

    for (const subAction of actions) {
      const { messages, shouldContinue } = this.handleAction(subAction, npc, player);
      retMessages.push(...messages);

      if (!shouldContinue) return { messages: retMessages, shouldContinue: false };
    }

    return { messages: retMessages, shouldContinue: true };
  }

  // CHECK for nearby npcs and drop items
  private handleCheckNPCAction(action: IDialogCheckNPCsAndDropItemsAction, npc: INPC, player: IPlayer): IActionResult {
    const { npcs, item, checkPassActions, checkFailActions } = action;

    const retMessages: string[] = [];

    let npcCount = 0;
    const npcsInView = this.game.worldManager.getMapStateForCharacter(npc)?.getAllInRange(npc, 4, [], false);
    npcsInView.forEach(npcRef => {
      const npcId = (npcRef as INPC).npcId;
      if (!npcs.includes(npcId)) return;

      npcCount++;
      npcRef.hp.current = -1;
      npcRef.dir = Direction.Corpse;
      this.game.deathHelper.npcDie(npcRef as INPC);
    });

    const didSucceed = npcCount > 0;

    if (didSucceed) {
      const items: ISimpleItem[] = [];
      for (let i = 0; i < npcCount; i++) {
        const itemRef = this.game.itemCreator.getSimpleItem(item);
        items.push(itemRef);
      }

      this.game.worldManager.getMapStateForCharacter(npc)?.addItemsToGround(npc.x, npc.y, items);
    }

    const actions = (didSucceed ? checkPassActions : checkFailActions) ?? [];

    for (const subAction of actions) {
      const { messages, shouldContinue } = this.handleAction(subAction, npc, player);
      retMessages.push(...messages);

      if (!shouldContinue) return { messages: retMessages, shouldContinue: false };
    }

    return { messages: retMessages, shouldContinue: true };
  }

  // CHECK for no item in player hand
  private handleCheckNoItemAction(action: IDialogCheckNoItemAction, npc: INPC, player: IPlayer): IActionResult {
    const { slot, fromHands, checkPassActions, checkFailActions } = action;

    const retMessages: string[] = [];

    let didSucceed = false;

    // if we check hands
    if (fromHands) {
      (slot || []).forEach(checkSlot => {
        if (didSucceed) return;

        const slotItem = player.items.equipment[checkSlot];
        if (slotItem) return;

        didSucceed = true;
      });
    }

    const actions = (didSucceed ? checkPassActions : checkFailActions) ?? [];

    for (const subAction of actions) {
      const { messages, shouldContinue } = this.handleAction(subAction, npc, player);
      retMessages.push(...messages);

      if (!shouldContinue) return { messages: retMessages, shouldContinue: false };
    }

    return { messages: retMessages, shouldContinue: true };
  }

  // TAKE an item from the player
  private handleTakeItemAction(action: IDialogTakeItemAction, npc: INPC, player: IPlayer): IActionResult {
    const { slot, item } = action;

    let didSucceed = false;

    (slot || []).forEach(checkSlot => {
      if (didSucceed) return;

      // we do something different to take from sack
      if (checkSlot === 'sack') {
        const matchingItems = player.items.sack.items.filter(x => x.name === item.name && this.game.itemHelper.isOwnedBy(player, x));
        const itemUUIDS = matchingItems.slice(0, item.amount ?? 1).map(x => x.uuid);
        this.game.inventoryHelper.removeItemsFromSackByUUID(player, itemUUIDS);
        didSucceed = true;
        return;
      }

      const slotItem = player.items.equipment[checkSlot];
      if (!slotItem) return;

      const { name } = item;
      if (slotItem.name !== template(name)(player)) return;
      if (!this.game.itemHelper.isOwnedBy(player, slotItem)) return;

      this.game.characterHelper.setEquipmentSlot(player, checkSlot as ItemSlot, undefined);

      didSucceed = true;
    });

    const messages: string[] = [];
    if (!didSucceed) messages.push('Hey! You need to bring me an item owned by you.');

    return { messages, shouldContinue: didSucceed };
  }

  // MODIFY an item held by the player
  private handleModifyItemAction(action: IDialogModifyItemAction, npc: INPC, player: IPlayer): IActionResult {
    const { slot, mods } = action;

    let didSucceed = false;

    (slot || []).forEach(checkSlot => {
      if (didSucceed) return;

      const slotItem = player.items.equipment[checkSlot];
      if (!slotItem) return;

      Object.assign(slotItem.mods, mods);

      didSucceed = true;
    });

    return { messages: [], shouldContinue: didSucceed };
  }

  // GIVE an item to the player
  private handleGiveItemAction(action: IDialogGiveItemAction, npc: INPC, player: IPlayer): IActionResult {
    const { slot, item } = action;

    let didSucceed = false;

    (slot || []).forEach(checkSlot => {
      if (didSucceed) return;

      const slotItem = player.items.equipment[checkSlot];
      if (slotItem) return;

      const simpleItem = this.game.itemCreator.getSimpleItem(template(item.name)(player));
      this.game.characterHelper.setEquipmentSlot(player, checkSlot as ItemSlot, simpleItem);

      didSucceed = true;
    });

    return { messages: [], shouldContinue: didSucceed };
  }

  // GIVE an item to the player after merging the stats with their existing item
  private handleMergeGiveItemAction(action: IDialogGiveItemAction, npc: INPC, player: IPlayer): IActionResult {
    const { slot, item } = action;

    let didSucceed = false;

    (slot || []).forEach(checkSlot => {
      if (didSucceed) return;

      const slotItem = player.items.equipment[checkSlot];
      if (!slotItem) return;

      const simpleItem = this.game.itemCreator.getSimpleItem(template(item.name)(player));
      this.game.characterHelper.setEquipmentSlot(player, checkSlot as ItemSlot, simpleItem);

      const oldStats = this.game.itemHelper.getItemProperty(slotItem, 'stats');

      simpleItem.mods.stats = oldStats;

      didSucceed = true;
    });

    return { messages: [], shouldContinue: didSucceed };
  }

  // CHECK if an item can be upgraded
  private handleItemCanUpgradeAction(action: IDialogCheckItemCanUpgradeAction, npc: INPC, player: IPlayer): IActionResult {
    const { slot, upgrade, checkPassActions, checkFailActions } = action;

    const retMessages: string[] = [];

    const checkItem = player.items.equipment[slot];
    let didSucceed = checkItem && this.game.itemHelper.isOwnedBy(player, checkItem) && this.game.itemHelper.canUpgradeItem(checkItem);
    if (upgrade && checkItem?.mods.upgrades?.includes(upgrade)) {
      didSucceed = false;
    }

    const actions = (didSucceed ? checkPassActions : checkFailActions) || [];

    for (const subAction of actions) {
      const { messages, shouldContinue } = this.handleAction(subAction, npc, player);
      retMessages.push(...messages);

      if (!shouldContinue) return { messages: retMessages, shouldContinue: false };
    }

    return { messages: retMessages, shouldContinue: true };
  }

  // GIVE an upgrade to a particular item
  private handleAddItemUpgradeAction(action: IDialogAddItemUpgradeAction, npc: INPC, player: IPlayer): IActionResult {

    const { slot, upgrade } = action;
    const checkItem = player.items.equipment[slot];
    if (!checkItem) return { messages: ['Nothing to upgrade?'], shouldContinue: false };

    this.game.itemHelper.upgradeItem(checkItem, template(upgrade)(player));

    return { messages: [], shouldContinue: true };
  }

  // GIVE an effect to the player
  private handleGiveEffectAction(action: IDialogGiveEffectAction, npc: INPC, player: IPlayer): IActionResult {

    const { effect, duration } = action;

    this.game.effectHelper.addEffect(player, npc, effect, { effect: { duration } });

    return { messages: [], shouldContinue: true };
  }

  // CHECK if the player has a quest complete (and complete it if they do)
  private handleCheckDailyQuestAction(action: IDialogCheckDailyQuestAction, npc: INPC, player: IPlayer): IActionResult {

    const maxDistance = action.maxDistance ?? 3;
    if (this.game.directionHelper.distFrom(player, npc) > maxDistance) {
      return { messages: ['Please come closer.'], shouldContinue: false };
    }

    const { quests, npc: npcName } = action;

    if (!this.game.dailyHelper.canDoDailyQuest(player, npcName)) {
      return {
        messages: ['Thanks, but you\'ve done all you can today. Come back tomorrow - I\'m sure there\'ll be work for you.'],
        shouldContinue: false
      };
    }

    const questTodayIndex = this.game.calculatorHelper.getCurrentDailyDayOfYear(player) % quests.length;
    const quest = quests[questTodayIndex];
    const questRef = this.game.questHelper.getQuest(quest);

    if (!questRef) {
      this.game.logger.error('DialogActionHelper:CheckDailyQuest', `Quest ${quest} does not exist.`);
      return { messages: ['That quest does not exist at this time.'], shouldContinue: true };
    }

    // if we don't have the quest, we skip - dialog continues
    if (!this.game.questHelper.hasQuest(player, quest)) return { messages: [], shouldContinue: true };

    // if we have the quest and it's complete, we send completion, and give rewards
    if (this.game.questHelper.isQuestComplete(player, quest)) {
      const compMsg = this.game.questHelper.formatQuestMessage(
        player, quest, questRef.messages.complete || `You've completed the quest "${quest}".`
      );
      this.game.questHelper.completeQuest(player, quest, npcName);

      return { messages: [compMsg], shouldContinue: false };
    }


    // should continue is false if we have the quest and it's incomplete
    // check if quest not complete, if not, send incomplete message
    // if complete, do complete

    return { messages: [
      this.game.questHelper.formatQuestMessage(player, quest, questRef.messages.incomplete || 'You\'re not done with this quest yet.')
    ], shouldContinue: false };
  }

  // CHECK if the player has a quest complete (and complete it if they do)
  private handleCheckQuestAction(action: IDialogCheckQuestAction, npc: INPC, player: IPlayer): IActionResult {

    const maxDistance = action.maxDistance ?? 3;
    if (this.game.directionHelper.distFrom(player, npc) > maxDistance) {
      return { messages: ['Please come closer.'], shouldContinue: false };
    }

    const { quest } = action;
    const questRef = this.game.questHelper.getQuest(quest);

    if (!questRef) {
      this.game.logger.error('DialogActionHelper:CheckQuest', `Quest ${quest} does not exist.`);
      return { messages: ['That quest does not exist at this time.'], shouldContinue: true };
    }

    // if we don't have the quest, we skip - dialog continues
    if (!this.game.questHelper.hasQuest(player, quest)) return { messages: [], shouldContinue: true };

    // if we have the quest and it's complete, we send completion, and give rewards
    if (this.game.questHelper.isQuestComplete(player, quest)) {
      const compMsg = this.game.questHelper.formatQuestMessage(
        player, quest, questRef.messages.complete || `You've completed the quest "${quest}".`
      );
      this.game.questHelper.completeQuest(player, quest);

      return { messages: [compMsg], shouldContinue: false };
    }


    // should continue is false if we have the quest and it's incomplete
    // check if quest not complete, if not, send incomplete message
    // if complete, do complete

    return { messages: [
      this.game.questHelper.formatQuestMessage(player, quest, questRef.messages.incomplete || 'You\'re not done with this quest yet.')
    ], shouldContinue: false };
  }

  // GIVE the player a daily quest
  private handleGiveDailyQuestAction(action: IDialogGiveDailyQuestAction, npc: INPC, player: IPlayer): IActionResult {

    const maxDistance = action.maxDistance ?? 3;
    if (this.game.directionHelper.distFrom(player, npc) > maxDistance) {
      return { messages: ['Please come closer.'], shouldContinue: false };
    }

    const { quests } = action;

    const questTodayIndex = this.game.calculatorHelper.getCurrentDailyDayOfYear(player) % quests.length;
    const quest = quests[questTodayIndex];
    const questRef = this.game.questHelper.getQuest(quest);

    if (!questRef) {
      this.game.logger.error('DialogActionHelper:GiveDailyQuest', `Quest ${quest} does not exist.`);
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

  // GIVE the player a quest
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

  // check if the player meets the requirement for the dialog option
  private meetsRequirement(player: IPlayer, requirement: IDialogRequirement): boolean {
    if (requirement.stat && requirement.statValue) {
      const stat = this.game.characterHelper.getStat(player, requirement.stat as Stat);
      if (stat < requirement.statValue) return false;
    }

    return true;
  }
}
