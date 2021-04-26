
import { Injectable } from 'injection-js';
import { template } from 'lodash';

import { Allegiance, Currency, IPlayer, IQuest, IQuestRequirement, IQuestRequirementItem,
  IQuestRequirementKill, MessageType, QuestRequirementType, QuestRewardType, Stat, TrackedStatistic } from '../../interfaces';
import { BaseService } from '../../models/BaseService';

import * as AllQuests from '../../../content/_output/quests.json';

@Injectable()
export class QuestHelper extends BaseService {

  public init() {}

  // get a full quest object
  public getQuest(quest: string): IQuest {
    return AllQuests[quest];
  }

  // check if the player has the specified quest
  public hasQuest(player: IPlayer, quest: string): boolean {
    return !!player.quests.activeQuestProgress[quest];
  }

  // whether or not the player can start the quest
  public canStartQuest(player: IPlayer, quest: string): boolean {
    return !player.quests.permanentQuestCompletion[quest];
  }

  // start the quest for the player - add a blank data & set up quest kills hash if needed
  public startQuest(player: IPlayer, quest: string): void {
    player.quests.activeQuestProgress[quest] = {};
    this.recalculateQuestKillsAndStatRewards(player);
  }

  // check if the player has completed a particular requirement (item or kill)
  public isRequirementComplete(player: IPlayer, quest: string, requirement: IQuestRequirement): boolean {

    // items only require being held
    if (requirement.type === QuestRequirementType.Item) {
      const req = requirement as IQuestRequirementItem;
      if (req.fromHands && this.game.characterHelper.hasHeldItemInEitherHand(player, req.item)) return true;

      return false;
    }

    // kills require a special data.kills to be set, and to exceed the right value
    if (requirement.type === QuestRequirementType.Kill) {
      const req = requirement as IQuestRequirementKill;
      const data = player.quests.activeQuestProgress[quest];
      if (!data) return false;
      if ((data.kills ?? 0) < req.killsRequired) return false;

      return true;
    }

    // default case is lol no
    return false;
  }

  // check if the quest is complete
  public isQuestComplete(player: IPlayer, quest: string): boolean {
    const questRef = this.getQuest(quest);
    if (!questRef) return false;

    return this.isRequirementComplete(player, quest, questRef.requirements);
  }

  // add arbitrary data to the quest
  public updateQuestData(player: IPlayer, quest: string, newData: any = {}): void {
    player.quests.activeQuestProgress[quest] = Object.assign({}, player.quests.activeQuestProgress[quest], newData);
  }

  public getQuestProgress(player: IPlayer, quest: string): any {
    return player.quests.activeQuestProgress[quest];
  }

  // increment kills for a particular quest
  public updateQuestProgressKill(player: IPlayer, quest: string): void {
    const questRef = this.getQuest(quest);
    if (!questRef) return;

    const data = player.quests.activeQuestProgress[quest] || {};
    data.kills = data.kills || 0;
    data.kills++;

    data.percentComplete = data.kills / questRef.requirements.killsRequired;
    data.rawValue = data.kills;
    data.rawValueMax = questRef.requirements.killsRequired;

    this.updateQuestData(player, quest, data);

    if (questRef.messages.kill && data.kills <= questRef.requirements.killsRequired) {
      this.game.messageHelper.sendLogMessageToPlayer(player, {
        message: this.formatQuestMessage(player, quest, `>>> ${questRef.messages.kill}`),
      }, [MessageType.Quest]);
    }
  }

  // try to update quest based on an npc id that was just killed
  public tryUpdateQuestProgressForKill(player: IPlayer, npcId: string): void {
    const updateQuests = player.quests.questKillWatches[npcId];
    if (!updateQuests || updateQuests.length === 0) return;

    updateQuests.forEach(quest => {
      this.updateQuestProgressKill(player, quest);
    });
  }

  // complete the quest, cleaning up old data & giving rewards
  public completeQuest(player: IPlayer, quest: string, questGiver?: string): void {
    const questRef = this.getQuest(quest);
    if (!questRef) return;

    // daily quests get a few things sorted - statistic & extra logic for finishing
    if (questRef.isDaily) {
      if (!questGiver) {
        this.game.logger.error('Quest:Daily', `Quest ${quest} does not have a quest giver associated.`);
        return;
      }

      this.game.statisticsHelper.addStatistic(player, TrackedStatistic.DailyQuests);
      this.game.dailyHelper.finishDailyQuest(player, questGiver);
    }

    // non-repeatable quests are marked off forever
    if (!questRef.isRepeatable) player.quests.permanentQuestCompletion[quest] = true;

    // repeatable non-daily quests get a statistic tracked
    if (questRef.isRepeatable && !questRef.isDaily) {
      this.game.statisticsHelper.addStatistic(player, TrackedStatistic.RepeatableQuests);
    }

    // if the quest required a held item, we take it
    if (questRef.requirements.type === QuestRequirementType.Item) {
      if (questRef.requirements.fromHands) {
        this.game.characterHelper.takeItemFromEitherHand(player, questRef.requirements.item);
      }
    }

    // remove progress from complete quest
    delete player.quests.activeQuestProgress[quest];

    this.giveQuestRewards(player, quest);
    this.recalculateQuestKillsAndStatRewards(player);
  }

  // give the quest rewards to the player
  public giveQuestRewards(player: IPlayer, quest: string): void {
    const questRef = this.getQuest(quest);
    if (!questRef) return;

    (questRef.rewards || []).forEach(reward => {

      if (reward.type === QuestRewardType.XP) {
        this.game.playerHelper.gainExp(player, reward.value);
        this.game.messageHelper.sendSimpleMessage(player, `You gained ${reward.value.toLocaleString()} XP!`);
      }

      if (reward.type === QuestRewardType.Gold) {
        this.game.currencyHelper.gainCurrency(player, reward.value, Currency.Gold);
        this.game.messageHelper.sendSimpleMessage(player, `You gained ${reward.value.toLocaleString()} gold!`);
      }

      if (reward.type === QuestRewardType.Silver) {
        this.game.subscriptionHelper.gainSilver(player, reward.value);
        this.game.messageHelper.sendSimpleMessage(player, `You gained ${reward.value.toLocaleString()} silver!`);
      }

      if (reward.type === QuestRewardType.Reputation) {
        this.game.playerHelper.modifyReputationForAllegiance(player, reward.statName as Allegiance, reward.value);
        this.game.messageHelper.sendSimpleMessage(player, `You gained ${reward.value.toLocaleString()} ${reward.statName} reputation!`);
      }

      if (reward.type === QuestRewardType.HolidayTokens) {
        this.game.holidayHelper.tryGrantHolidayTokens(player, reward.value);
      }

    });
  }

  // called on login and when a quest is completed
  public recalculateQuestKillsAndStatRewards(player: IPlayer): void {
    player.quests.questKillWatches = this.calculateKillHash(player);
    player.quests.questStats = this.calulateStatHash(player);
  }

  // used to calculate a hash of npcId:QuestName for when a player kills something, so it can easily be looked up
  // should be recalculated only when accepting a new quest or completing an old one
  // should not be persisted
  public calculateKillHash(player: IPlayer): Record<string, string[]> {
    const questKills = {};

    Object.keys(player.quests.activeQuestProgress).forEach(quest => {
      const questRef = this.getQuest(quest);
      if (!questRef) return;

      const req = questRef.requirements;
      if (!req.npcIds || !req.killsRequired) return;

      req.npcIds.forEach(npcId => {
        questKills[npcId] = questKills[npcId] || [];
        questKills[npcId].push(quest);
      });
    });

    return questKills;
  }

  // used to calculate a hash of stat:value based on quest rewards, so players can get perm stats from quests
  // should be recalculated only when a quest is completed and marked permanently complete
  // should not be persisted
  public calulateStatHash(player: IPlayer): Partial<Record<Stat, number>> {
    const stats = {};

    Object.keys(player.quests.permanentQuestCompletion).forEach(quest => {
      const questRef = this.getQuest(quest);
      if (!questRef) return;

      questRef.rewards.forEach(reward => {
        if (reward.type !== QuestRewardType.Stat) return;
        const statName = reward.statName as Stat;

        stats[statName] = stats[statName] || 0;
        stats[statName] += reward.value;
      });
    });

    return stats;
  }

  // format a quest message based on whatever variables it needs
  public formatQuestMessage(player: IPlayer, quest: string, message: string): string {
    if (!message) return '';

    const scope: any = { player, current: 0, total: 0, remaining: 0 };

    const questRef = this.getQuest(quest);
    if (!questRef) return message;

    if (questRef.requirements.type === QuestRequirementType.Kill) {
      const data = player.quests.activeQuestProgress[quest];
      scope.current = data.kills ?? 0;
      scope.total = questRef.requirements.killsRequired ?? 0;
      scope.remaining = scope.total - scope.current;
    }

    return template(message)(scope);
  }

}
