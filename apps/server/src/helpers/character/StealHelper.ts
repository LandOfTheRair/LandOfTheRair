import { Injectable } from 'injection-js';
import { random, sample } from 'lodash';

import {
  getEmptyHand,
  getSkillLevel,
  getStat,
  isPlayer,
} from '@lotr/characters';
import { settingClassConfigGet, settingGameGet } from '@lotr/content';
import { getCurrency, loseCurrency } from '@lotr/currency';
import type { ICharacter, IPlayer, ISimpleItem } from '@lotr/interfaces';
import { Skill, Stat } from '@lotr/interfaces';
import { BaseService } from '../../models/BaseService';

@Injectable()
export class StealHelper extends BaseService {
  public init() {}

  private sendMessage(
    to: ICharacter,
    co: ICharacter,
    message: string,
    target?: boolean,
  ): void {
    const base: any = { message };
    if (target) base.setTarget = co.uuid;
    this.game.messageHelper.sendLogMessageToPlayer(to, base);
  }

  private gainThiefSkill(gainer: ICharacter, value: number): void {
    if (!isPlayer(gainer)) return;
    this.game.playerHelper.tryGainSkill(
      gainer as IPlayer,
      Skill.Thievery,
      value,
    );
  }

  public async trySteal(char: ICharacter, target: ICharacter): Promise<void> {
    const thiefBonusMultiplier =
      settingGameGet('character', 'thiefBonusMultiplier') ?? 1.5;
    const goldStealDifficulty =
      settingGameGet('character', 'goldStealDifficulty') ?? 3;
    const itemStealDifficulty =
      settingGameGet('character', 'itemStealDifficulty') ?? 10;
    const stealSkillLower = settingGameGet('character', 'stealSkillLower') ?? 3;
    const stealSkillUpper = settingGameGet('character', 'stealSkillUpper') ?? 5;
    const stealLevelRangeForSkillGain =
      settingGameGet('character', 'stealLevelRangeForSkillGain') ?? 3;

    const targetGold = getCurrency(target);

    // if they have nothing to steal, we bail
    if (target.items.sack.items.length === 0 && targetGold <= 0) {
      this.game.characterHelper.addAgro(char, target, 1);
      this.sendMessage(
        char,
        target,
        "You can't seem to find anything to take!",
        true,
      );
      return;
    }

    const myStealth = getStat(char, Stat.Stealth);
    const yourPerception = getStat(target, Stat.Perception);

    const myHasStealBonus = settingClassConfigGet<'hasStealBonus'>(
      char.baseClass,
      'hasStealBonus',
    );

    const targetHasStealBonus = settingClassConfigGet<'hasStealBonus'>(
      target.baseClass,
      'hasStealBonus',
    );

    const mySkill =
      getSkillLevel(char, Skill.Thievery) *
      (myHasStealBonus ? thiefBonusMultiplier : 1);
    const yourSkill =
      getSkillLevel(target, Skill.Thievery) *
      (targetHasStealBonus ? thiefBonusMultiplier : 1);

    const stealRoll = random(-yourSkill, mySkill);

    const thiefName = yourPerception > myStealth ? char.name : 'somebody';

    const nimbleFingersLevelValue = this.game.traitHelper.traitLevelValue(
      char,
      'NimbleFingers',
    );
    const stealMod =
      1 +
      this.game.traitHelper.traitLevelValue(char, 'ImprovedSteal') +
      nimbleFingersLevelValue;

    if (targetGold > 0) {
      const difficulty = goldStealDifficulty;

      if (stealRoll + stealMod - difficulty < 0) {
        this.gainThiefSkill(char, 1);
        this.game.characterHelper.addAgro(char, target, 1);
        this.sendMessage(
          char,
          target,
          'Your stealing attempt was thwarted!',
          true,
        );
        this.sendMessage(
          target,
          char,
          `${thiefName} just tried to steal from you!`,
          true,
        );
        return;
      }

      const fuzzedSkill = random(
        Math.max(mySkill - stealSkillLower, 1),
        mySkill + stealSkillUpper,
      );

      const stolenGold = Math.max(
        1,
        Math.min(
          targetGold,
          nimbleFingersLevelValue * mySkill * 100 * stealMod,
          Math.max(5, Math.floor(targetGold * (fuzzedSkill / 100))),
        ),
      );

      const handName = getEmptyHand(char);
      if (!handName) return;

      loseCurrency(target, stolenGold);
      const item = this.game.itemCreator.getGold(stolenGold);

      this.game.characterHelper.setEquipmentSlot(char, handName, item);

      this.sendMessage(
        char,
        target,
        `You stole ${stolenGold} gold from ${target.name}!`,
        true,
      );
      return;
    } else if (target.items.sack.items.length > 0) {
      const difficulty = itemStealDifficulty;

      if (stealRoll + stealMod - difficulty < 0) {
        this.gainThiefSkill(char, 1);
        this.game.characterHelper.addAgro(char, target, 1);
        this.sendMessage(
          char,
          target,
          'Your stealing attempt was thwarted!',
          true,
        );
        this.sendMessage(
          target,
          char,
          `${thiefName} just tried to steal from you!`,
          true,
        );
        return;
      }

      const handName = getEmptyHand(char);
      if (!handName) return;

      const item = sample(target.items.sack.items) as ISimpleItem;
      const itemDef = this.game.itemHelper.getItemDefinition(item.name);
      this.game.inventoryHelper.removeItemsFromSackByUUID(target, [item.uuid]);

      this.game.characterHelper.setEquipmentSlot(char, handName, item);

      this.sendMessage(
        char,
        target,
        `You stole a ${itemDef.itemClass.toLowerCase()} from ${target.name}!`,
        true,
      );

      if (!isPlayer(char)) {
        this.game.messageHelper.sendLogMessageToRadius(char, 4, {
          message: `Thanks for the ${itemDef.itemClass.toLowerCase()}, ${target.name}!`,
        });
      }
    }

    if (char.level < target.level + stealLevelRangeForSkillGain) {
      this.gainThiefSkill(char, 3);
    }
  }
}
