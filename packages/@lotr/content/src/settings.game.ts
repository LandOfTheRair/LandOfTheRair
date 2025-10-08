import {
  calculateSkillXPRequiredForLevel,
  calculateXPRequiredForLevel,
} from '@lotr/exp';
import { settingGameGet } from './settings';

let maxLevel = 50;
let maxSkill = 30;
let maxStats = 25;
let potionStats = {};
let maxExp = 0;
let maxSkillExp = 0;

const gameOptions = {
  frozenAI: false,
};

export function settingsLoadForGame() {
  maxLevel = settingGameGet('character', 'maxLevel');
  maxSkill = settingGameGet('character', 'maxSkill');
  maxStats = settingGameGet('character', 'maxStats');
  potionStats = settingGameGet('potion');

  maxExp = calculateXPRequiredForLevel(maxLevel);
  maxSkillExp = calculateSkillXPRequiredForLevel(maxSkill);
}

export function settingIsAIActive() {
  return !gameOptions.frozenAI;
}

export function toggleAIFreeze() {
  gameOptions.frozenAI = !gameOptions.frozenAI;
}

export function settingGetMaxLevel() {
  return maxLevel;
}

export function settingGetMaxSkill() {
  return maxSkill;
}

export function settingGetMaxStats() {
  return maxStats;
}

export function settingGetPotionStats() {
  return potionStats;
}

export function settingGetMaxExp() {
  return maxExp;
}

export function settingGetMaxSkillExp() {
  return maxSkillExp;
}
