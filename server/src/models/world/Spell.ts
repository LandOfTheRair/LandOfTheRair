
import { random, sum } from 'lodash';

import { BaseClass, DeepPartial, ICharacter, IItemEffect, ISpellData,
  IStatusEffectData, ItemSlot, MessageInfo, MessageType, Skill } from '../../interfaces';

import { Game } from '../../helpers';
import { BaseSpell } from '../../interfaces/BaseSpell';

export class Spell implements BaseSpell {

  constructor(protected game: Game) {}

  public sendMessage(character: ICharacter|string, message: MessageInfo, messageTypes: MessageType[] = [MessageType.Miscellaneous]): void {
    this.game.messageHelper.sendLogMessageToPlayer(character, message, messageTypes);
  }

  public formatMessage(message: string, args: { target?: string; caster?: string }): string {
    return message
      .split('%target').join(args.target ?? 'somebody')
      .split('%caster').join(args.caster ?? 'somebody');
  }

  public cast(caster: ICharacter | null, target: ICharacter | null, override: Partial<IItemEffect>): void {}

  public getOverrideEffectInfo(
    caster: ICharacter | null, target: ICharacter | null, spellData: ISpellData, override: Partial<IItemEffect> = {}
  ): DeepPartial<IStatusEffectData> {
    return {
      effect: {
        duration: override.duration ?? this.getDuration(caster, target, spellData),
        extra: {
          charges: override.charges ?? this.getCharges(caster, target, spellData),
          potency: override.potency ?? this.getPotency(caster, target, spellData)
        }
      },
      tooltip: {
        desc: this.getUnformattedTooltipDesc(caster, target, spellData)
      }
    };
  }

  public getUnformattedTooltipDesc(caster: ICharacter | null, target: ICharacter | null, spellData: ISpellData): string {
    return '';
  }

  public getDuration(caster: ICharacter | null, target: ICharacter | null, spellData: ISpellData): number {
    return 0;
  }

  public getCharges(caster: ICharacter | null, target: ICharacter | null, spellData: ISpellData): number {
    return 0;
  }

  public getPotency(caster: ICharacter | null, target: ICharacter | null, spellData: ISpellData): number {

    if (!caster) return 1;

    const skills = {
      [BaseClass.Healer]: Skill.Restoration,
      [BaseClass.Mage]: Skill.Conjuration,
      [BaseClass.Thief]: Skill.Thievery
    };

    const isStatic = spellData.spellMeta?.staticPotency;

    let skillsToAverage = [skills[caster.baseClass]];
    if (!skills[caster.baseClass]) {

      if (caster.items.equipment[ItemSlot.RightHand]) {
        const { type, secondaryType } = this.game.itemHelper.getItemProperties(
          caster.items.equipment[ItemSlot.RightHand], ['type', 'secondaryType']
        );
        skillsToAverage = [type, secondaryType];
      } else {
        skillsToAverage = [Skill.Martial];
      }

    }

    skillsToAverage = skillsToAverage.filter(Boolean);

    const baseSkillValue = Math.floor(sum(
      skillsToAverage.map(skill => this.game.characterHelper.getSkillLevel(caster, skill) + 1)
    ) / skillsToAverage.length);

    const statMult = caster ? this.game.characterHelper.getStat(caster, this.game.characterHelper.castStat(caster)) : 1;

    const bonusRolls = isStatic
      ? 0
      : random(spellData.bonusRollsMin ?? 0, spellData.bonusRollsMax ?? 0);

    let retPotency = isStatic
      ? (baseSkillValue + bonusRolls) * statMult
      : this.game.diceRollerHelper.diceRoll(baseSkillValue + bonusRolls, statMult);

    let maxMult = 1;
    (spellData.skillMultiplierChanges || []).forEach(([baseSkill, mult]) => {
      if (baseSkillValue < baseSkill) return;
      maxMult = mult;
    });

    retPotency *= maxMult;
    retPotency *= (spellData.potencyMultiplier || 1);

    // encumberance cuts potency exactly in half
    if (this.game.effectHelper.hasEffect(caster, 'Encumbered')) {
      retPotency /= 2;
    }

    if (this.game.effectHelper.hasEffect(caster, 'Dazed') &&
       this.game.diceRollerHelper.XInOneHundred(this.game.effectHelper.getEffectPotency(caster, 'Dazed'))
    ) {
      retPotency /= 2;
      this.sendMessage(caster, { message: 'You struggle to concentrate!' });
    }

    return Math.max(1, Math.floor(retPotency));
  }

}
