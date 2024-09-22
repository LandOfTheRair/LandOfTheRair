import { Injectable } from 'injection-js';
import { GameServerResponse, IAchievement } from '../../interfaces';
import { Player } from '../../models';
import { BaseService } from '../../models/BaseService';

@Injectable()
export class AchievementsHelper extends BaseService {
  private npcIdHash: Record<string, IAchievement> = {};
  private itemHash: Record<string, IAchievement> = {};

  public init() {
    Object.values(this.game.contentManager.allAchievements).forEach((ach) => {
      if (ach.requirements.kill.npc) {
        this.npcIdHash[ach.requirements.kill.npc] = ach;
      }

      if (ach.requirements.bindItem.item) {
        this.itemHash[ach.requirements.bindItem.item] = ach;
      }
    });
  }

  public getNPCForAchievementUse(npcId: string): IAchievement {
    return this.npcIdHash[npcId];
  }

  public getItemForAchievementUse(itemId: string): IAchievement {
    return this.itemHash[itemId];
  }

  public checkAllAchievements(player: Player): void {
    Object.values(this.game.contentManager.allAchievements).forEach((ach) => {
      if (this.hasAchievement(player, ach.name)) return;
      if (!this.hasEarnedAchievement(player, ach)) return;

      this.earnAchievement(player, ach.name);
    });
  }

  public hasEarnedAchievement(
    player: Player,
    achievement: IAchievement,
  ): boolean {
    if (achievement.requirements.level.level) {
      return (
        player.baseClass === achievement.requirements.level.baseClass &&
        player.level >= achievement.requirements.level.level
      );
    }

    if (achievement.requirements.skill.skill) {
      const curLevel = this.game.calculatorHelper.calcSkillLevelForCharacter(
        player,
        achievement.requirements.skill.skill,
      );

      return curLevel >= achievement.requirements.skill.level;
    }

    if (achievement.requirements.tradeskill.tradeskill) {
      const curLevel =
        this.game.calculatorHelper.calcTradeskillLevelForCharacter(
          player,
          achievement.requirements.tradeskill.tradeskill,
        );

      return curLevel >= achievement.requirements.tradeskill.level;
    }

    return false;
  }

  public doesAchievementExist(achievement: string): boolean {
    return this.game.contentManager.hasAchievement(achievement);
  }

  public hasAchievement(player: Player, achievement: string): boolean {
    return !!player.achievements.achievements[achievement];
  }

  public unearnAchievement(player: Player, achievement: string) {
    delete player.achievements.achievements[achievement];
  }

  public earnAchievement(player: Player, achievement: string) {
    const achievementData =
      this.game.contentManager.getAchievement(achievement);
    if (!achievementData) return;

    if (this.hasAchievement(player, achievement)) return;

    player.achievements.achievements[achievement] = {
      earnedAt: Date.now(),
    };

    this.game.wsCmdHandler.sendToSocket(player.username, {
      type: GameServerResponse.SendAchievement,
      achievement: achievementData,
    });

    if (achievementData.shareWithParty) {
      this.game.partyHelper
        .getAllPartyMembersInRange(player)
        .forEach((member) => {
          this.earnAchievement(member as Player, achievement);
        });
    }
  }
}
