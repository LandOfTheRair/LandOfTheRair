import { BaseClass, Skill, Tradeskill } from './building-blocks';

export interface IEarnedAchievement {
  earnedAt: number;
}

export interface IAchievementRequirements {
  level: {
    baseClass: BaseClass;
    level: number;
  };

  skill: {
    skill: Skill;
    level: number;
  };

  tradeskill: {
    tradeskill: Tradeskill;
    level: number;
  };

  kill: {
    npc: string;
  };

  bindItem: {
    item: string;
  };
}

export interface IAchievement {
  name: string;
  icon: string;
  iconColor: string;
  iconBgColor: string;
  iconBorderColor: string;
  activationType: keyof IAchievementRequirements | 'other';
  desc: string;
  ap: number;
  shareWithParty: boolean;
  hidden: boolean;

  requirements: IAchievementRequirements;
}

export interface IAccountAchievements {
  achievements: Record<string, IEarnedAchievement>;
}
