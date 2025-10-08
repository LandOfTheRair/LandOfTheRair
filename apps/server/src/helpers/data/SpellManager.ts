import { Injectable } from 'injection-js';
import { cloneDeep, random, sum } from 'lodash';

import { getSkillLevel, getStat, isDead, isPlayer } from '@lotr/characters';
import {
  itemPropertiesGet,
  settingClassConfigGet,
  settingGameGet,
  spellGet,
  spellGetAll,
  traitLevelValue,
} from '@lotr/content';
import { getEffect, getEffectPotency, hasEffect } from '@lotr/effects';
import { calcSkillLevelForCharacter } from '@lotr/exp';
import type {
  BaseSpell,
  ICharacter,
  IItemEffect,
  IMacroCommandArgs,
  IPlayer,
  ISpellData,
  IStatusEffectData,
} from '@lotr/interfaces';
import {
  DamageClass,
  ItemSlot,
  MessageType,
  Skill,
  SoundEffect,
  Stat,
} from '@lotr/interfaces';
import { consoleError } from '@lotr/logger';
import { diceRoll, oneToStat, rollInOneHundred } from '@lotr/rng';
import type { Player } from '../../models';
import { BaseService } from '../../models/BaseService';
import { Spell } from '../../models/world/Spell';
import * as allSpellRefs from '../game/spells';

@Injectable()
export class SpellManager extends BaseService {
  private dazedDivisor = 2;
  private encumberedDivisor = 2;
  private skillGainedPerCast = 1;
  private skillGainedPerAOECast = 0.01;

  private spells: Record<string, BaseSpell> = {};

  // initialize all of the spells that exist
  public init() {
    const baseSpellList = cloneDeep(spellGetAll());

    Object.keys(allSpellRefs).forEach((spell) => {
      this.spells[spell] = new allSpellRefs[spell](this.game);
      delete baseSpellList[spell];
    });

    Object.keys(baseSpellList).forEach((otherSpellName) => {
      this.spells[otherSpellName] = new Spell(this.game);
    });

    this.dazedDivisor = settingGameGet('spell', 'dazedDivisor') ?? 2;
    this.encumberedDivisor = settingGameGet('spell', 'encumberedDivisor') ?? 2;
    this.skillGainedPerCast = settingGameGet('spell', 'encumberedDivisor') ?? 1;
    this.skillGainedPerAOECast =
      settingGameGet('spell', 'encumberedDivisor') ?? 0.01;
  }

  // get the raw YML spell data
  public getSpellData(key: string, context: string): ISpellData {
    return spellGet(key, context);
  }

  // get the ref to the spell for casting
  public getSpell(key: string): BaseSpell {
    return this.spells[key];
  }

  private getPotencyMultiplier(spellData: ISpellData): number {
    return (
      this.game.worldDB.getSpellMultiplierOverride(spellData.spellName) ||
      spellData.potencyMultiplier ||
      1
    );
  }

  // get the potency for the spell based on caster/target
  public getPotency(
    caster: ICharacter | null,
    target: ICharacter | null,
    spellData: ISpellData,
  ): number {
    if (!caster) return 1;

    const castSkill = settingClassConfigGet<'castSkill'>(
      caster.baseClass,
      'castSkill',
    );

    const isStatic = spellData.spellMeta?.staticPotency;

    let skillsToAverage: Skill[] = [castSkill] as Skill[];
    if (!castSkill) {
      if (caster.items.equipment[ItemSlot.RightHand]) {
        const { type, secondaryType } = itemPropertiesGet(
          caster.items.equipment[ItemSlot.RightHand],
          ['type', 'secondaryType'],
        );
        skillsToAverage = [type, secondaryType] as Skill[];
      } else {
        skillsToAverage = [Skill.Martial];
      }
    }

    skillsToAverage = skillsToAverage.filter(Boolean);

    const baseSkillValue = Math.floor(
      sum(skillsToAverage.map((skill) => getSkillLevel(caster, skill) + 1)) /
        skillsToAverage.length,
    );

    if (spellData.spellMeta.useSkillAsPotency) {
      return Math.floor(baseSkillValue * this.getPotencyMultiplier(spellData));
    }

    const baseStat = getStat(
      caster,
      this.game.characterHelper.castStat(caster),
    );
    const statMult = caster ? baseStat : 1;

    const bonusRolls = isStatic
      ? 0
      : random(spellData.bonusRollsMin ?? 0, spellData.bonusRollsMax ?? 0);

    const basePotency = diceRoll(baseSkillValue + bonusRolls, statMult);
    let retPotency = isStatic ? baseSkillValue * statMult : basePotency;

    let maxMult = 1;
    (spellData.skillMultiplierChanges || []).forEach(([baseSkill, mult]) => {
      if (baseSkillValue < baseSkill) return;
      maxMult = mult;
    });

    retPotency *= maxMult;
    retPotency *= this.getPotencyMultiplier(spellData);

    if (spellData.spellMeta.doesAttack) {
      const arcaneHunger = getEffect(caster, 'ArcaneHunger');
      if (arcaneHunger) {
        const charges = arcaneHunger.effectInfo.charges ?? 0;
        retPotency += retPotency * (charges / 10);
      }
    }

    // encumberance cuts potency exactly in half
    if (hasEffect(caster, 'Encumbered')) {
      retPotency /= this.encumberedDivisor;
    }

    if (
      hasEffect(caster, 'Dazed') &&
      rollInOneHundred(getEffectPotency(caster, 'Dazed'))
    ) {
      retPotency /= this.dazedDivisor;
      this.game.messageHelper.sendLogMessageToPlayer(
        caster,
        { message: 'You struggle to concentrate!' },
        [MessageType.Miscellaneous],
      );
    }

    return Math.max(1, Math.floor(retPotency));
  }

  // gain skill for casting a spell
  private gainSkill(caster: ICharacter, spellData: ISpellData): void {
    const skillGain = settingClassConfigGet<'castSkill'>(
      caster.baseClass,
      'castSkill',
    );
    if (!skillGain) return;

    const skillLevel = calcSkillLevelForCharacter(caster, skillGain);
    if (skillLevel > (spellData.maxSkillForGain ?? 0)) return;

    const skillsFlagged =
      hasEffect(caster, 'Hidden') && skillGain !== Skill.Thievery
        ? [skillGain, Skill.Thievery]
        : [skillGain];

    const skillGained = spellData.spellMeta.aoe
      ? this.skillGainedPerAOECast
      : this.skillGainedPerCast;
    this.game.playerHelper.flagSkill(caster as Player, skillsFlagged);
    this.game.playerHelper.gainCurrentSkills(caster as Player, skillGained);
  }

  private canCastSpell(character: ICharacter, spellName: string): boolean {
    return Date.now() > (character.spellCooldowns?.[spellName] ?? 0);
  }

  private cooldownSpell(
    character: ICharacter,
    spellName: string,
    spellData: ISpellData,
  ): void {
    if (!spellData.cooldown) return;

    character.spellCooldowns = character.spellCooldowns || {};
    character.spellCooldowns[spellName] =
      Date.now() + 1000 * (spellData.cooldown ?? 0);
  }

  public resetCooldown(character: ICharacter, spellName: string) {
    delete character.spellCooldowns?.[spellName];
  }

  // cast a spell!
  public castSpell(
    spell: string,
    caster: ICharacter | null = null,
    target: ICharacter | null = null,
    override: Partial<IItemEffect> = {},
    callbacks?: any,
    originalArgs?: Partial<IMacroCommandArgs>,
    targetsPosition?: { x: number; y: number; map: string },
  ): void {
    if (!caster && !target) return;

    if (target && isDead(target)) return;

    const spellData = this.getSpellData(spell, `CS:${caster?.name}`);
    if (!spellData) {
      consoleError(
        'SpellManager',
        new Error(`Tried to cast invalid spell ${spell}.`),
      );
      return;
    }

    const spellRef = this.getSpell(spell);
    if (!spellRef) {
      consoleError(
        'SpellManager',
        new Error(`Tried to ref invalid spell ${spell}.`),
      );
      return;
    }

    if (caster) {
      override = this.seekSpellOverrides(caster, spellData, override);
    }

    if (caster && isPlayer(caster)) {
      const castSkill = settingClassConfigGet<'castSkill'>(
        caster.baseClass,
        'castSkill',
      );

      this.game.playerHelper.flagSkill(caster as IPlayer, castSkill);
    }

    // send messages to caster/target where applicable
    const {
      casterMessage,
      casterSfx,
      targetMessage,
      targetSfx,
      resistLowerTrait,
      creatureSummoned,
      extraAttackTrait,
      doesAttack,
      doesHeal,
      doesOvertime,
      targetsCaster,
      noHostileTarget,
      bonusAgro,
      canBeResisted,
      range,
      fizzledBy,
    } = spellData.spellMeta;

    if (target && fizzledBy && fizzledBy.length > 0) {
      if (
        fizzledBy.some((effectToFizzleOn) =>
          hasEffect(target, effectToFizzleOn),
        )
      ) {
        if (caster) {
          this.game.messageHelper.sendSimpleMessage(
            caster,
            `Your ${spell} spell fizzles on that creature!`,
          );
        }

        return;
      }
    }

    // buff spells can't be cast on hostiles
    if (
      caster &&
      target &&
      noHostileTarget &&
      this.game.targettingHelper.checkTargetForHostility(caster, target) &&
      !isPlayer(target)
    ) {
      this.game.messageHelper.sendSimpleMessage(
        caster,
        'You cannot target that creature with this spell!',
      );
      return;
    }

    // spell can fail sometimes, usually this only happens when doing a melee attack w/ weapon that casts spells
    const chance = override.chance || 100;
    if (!rollInOneHundred(chance)) return;

    // gain skill for the spell cast, but only if you're actually casting it
    if (caster && chance === 100) {
      if (!this.canCastSpell(caster, spell)) {
        this.game.messageHelper.sendSimpleMessage(
          caster,
          'That spell is still cooling down!',
        );
        return;
      }

      this.gainSkill(caster, spellData);
      this.cooldownSpell(caster, spell, spellData);
    }

    // always apply agro
    if (bonusAgro && caster && target) {
      this.game.characterHelper.addAgro(caster, target, bonusAgro);
    }

    // try to resist the spell
    if (caster && target && canBeResisted) {
      const casterRoll =
        oneToStat(caster, this.game.characterHelper.castStat(caster)) +
        (resistLowerTrait ? traitLevelValue(caster, resistLowerTrait) : 0);
      const targetRoll =
        oneToStat(target, Stat.WIL) + getStat(target, Stat.SavingThrow);

      if (targetRoll > casterRoll) {
        this.game.messageHelper.sendSimpleMessage(
          caster,
          `${target.name} resisted your spell!`,
        );
        return;
      }
    }

    // send a message to the target
    if (target && targetMessage) {
      this.game.messageHelper.sendLogMessageToPlayer(target, {
        message: targetMessage,
        sfx: targetSfx as SoundEffect,
      });
    }

    // try to add a buff effect if needed
    if (doesOvertime && target) {
      const spellEffInfo = spellRef.getOverrideEffectInfo(
        caster,
        target,
        spellData,
        override,
      );

      if (
        caster &&
        noHostileTarget &&
        spellEffInfo.effect?.duration &&
        spellEffInfo.effect.duration !== -1
      ) {
        spellEffInfo.effect.duration = Math.floor(
          spellEffInfo.effect.duration *
            (1 + traitLevelValue(caster, 'EffectiveSupporter')),
        );
      }

      this.game.effectHelper.addEffect(
        target,
        caster ?? 'somebody',
        spell,
        spellEffInfo,
      );
    }

    // try to summon creatures if possible
    if ((creatureSummoned?.length ?? 0) > 0 && target) {
      const spellEffInfo = spellRef.getOverrideEffectInfo(
        caster,
        caster,
        spellData,
        override,
      );
      const ffEffectData: IStatusEffectData = cloneDeep(
        this.game.effectManager.getEffectData(
          spell,
          `FF:${caster?.name}:${spellData.spellName}`,
        ),
      );
      ffEffectData.effect.duration = spellEffInfo.effect?.duration ?? 10;
      ffEffectData.effect.extra.potency =
        spellEffInfo.effect?.extra?.potency ?? 10;
      ffEffectData.effect.extra.effectIcon = ffEffectData.tooltip.icon;
      ffEffectData.effect.extra.summonCreatures = spellData.spellMeta
        .creatureSummoned ?? ['Mage Summon Deer'];

      this.game.effectHelper.addEffect(
        target,
        caster ?? 'somebody',
        'FindFamiliar',
        ffEffectData,
      );
    }

    // cast the spell however many number of times
    let numCasts = 1;
    if (caster && extraAttackTrait) {
      numCasts += traitLevelValue(caster, extraAttackTrait);
    }

    for (let i = 0; i < numCasts; i++) {
      const potency =
        override.potency ||
        this.game.spellManager.getPotency(caster, target, spellData);
      const spellRange = override.range ?? range ?? 0;
      const duration = override.duration || 0;

      if (target && doesAttack) {
        this.game.combatHelper.magicalAttack(caster, target, {
          atkMsg: spellData.spellMeta.casterAttackMessage || '',
          defMsg: spellData.spellMeta.targetAttackMessage || '',
          sfx: i === 0 ? SoundEffect.CombatHitSpell : undefined,
          damage: potency,
          damageClass:
            override.damageClass || spellData.damageClass || DamageClass.Energy,
          spellData,
        });
      }

      if (target && doesHeal) {
        this.game.combatHelper.magicalAttack(caster, target, {
          atkMsg: spellData.spellMeta.casterAttackMessage || '',
          defMsg: spellData.spellMeta.targetAttackMessage || '',
          sfx: i === 0 ? SoundEffect.SpellHeal : undefined,
          damage: -potency,
          damageClass:
            override.damageClass || spellData.damageClass || DamageClass.Heal,
          spellData,
        });
      }

      spellRef.cast(caster, target, {
        potency,
        range: spellRange,
        duration,
        callbacks,
        spellData,
        originalArgs,
        ...(targetsPosition || {}),
      });
    }

    if (caster) {
      this.handleArcaneHunger(caster, spellData);
    }
  }

  private seekSpellOverrides(
    caster: ICharacter,
    spellData: ISpellData,
    overrides: Partial<IItemEffect>,
  ): Partial<IItemEffect> {
    if (spellData.spellName === 'MagicMissile') {
      if (traitLevelValue(caster, 'SonicMissiles')) {
        overrides.damageClass = DamageClass.Sonic;
      }
    }

    return overrides;
  }

  // check for arcane hunger
  private handleArcaneHunger(caster: ICharacter, spellData: ISpellData) {
    if (!spellData.spellMeta.doesAttack) return;

    const arcaneHungerSet = traitLevelValue(caster, 'ArcaneHunger');

    if (arcaneHungerSet > 0) {
      const existingEffect = getEffect(caster, 'ArcaneHunger');

      const arcaneHungerMax = 3 + Math.floor(caster.level / 4);

      const chargeSet = Math.min(
        arcaneHungerMax,
        1 + (existingEffect?.effectInfo.charges ?? 0),
      );

      this.game.effectHelper.addEffect(caster, caster, 'ArcaneHunger', {
        effect: {
          extra: {
            charges: chargeSet,
          },
        },
      });
    }
  }
}
