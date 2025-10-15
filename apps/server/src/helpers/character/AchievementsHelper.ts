import {
  achievementAll,
  achievementGet,
  achievementHas,
  achievementHasEarned,
} from '@lotr/content';

import { wsSendToSocket } from '@lotr/core';
import { GameServerResponse } from '@lotr/interfaces';
import { Injectable } from 'injection-js';
import type { Player } from '../../models';
import { BaseService } from '../../models/BaseService';

@Injectable()
export class AchievementsHelper extends BaseService {
  public init() {}

  public achievementsCheckAll(player: Player): void {
    Object.values(achievementAll()).forEach((ach) => {
      if (achievementHas(player, ach.name)) return;
      if (!achievementHasEarned(player, ach)) return;

      this.achievementEarn(player, ach.name);
    });
  }

  public achievementUnearn(player: Player, achievement: string) {
    delete player.achievements.achievements[achievement];
  }

  public achievementEarn(player: Player, achievement: string) {
    const achievementData = achievementGet(achievement);
    if (!achievementData) return;

    if (achievementHas(player, achievement)) return;

    player.achievements.achievements[achievement] = {
      earnedAt: Date.now(),
    };

    wsSendToSocket(player.username, {
      type: GameServerResponse.SendAchievement,
      achievement: achievementData,
    });

    if (achievementData.shareWithParty) {
      this.game.partyHelper
        .getAllPartyMembersInRange(player)
        .forEach((member) => {
          this.achievementEarn(member as Player, achievement);
        });
    }
  }
}
