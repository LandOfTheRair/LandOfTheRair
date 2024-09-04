import { Injectable } from 'injection-js';
import { cloneDeep, random, sum } from 'lodash';

import {
  BaseSpell,
  DamageClass,
  ICharacter,
  IItemEffect,
  IMacroCommandArgs,
  ISpellData,
  IStatusEffectData,
  ItemSlot,
  MessageType,
  Skill,
  SoundEffect,
  Stat,
} from '../../interfaces';

import { Player } from '../../models';
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
    const baseSpellList = this.game.contentManager.getSpells();

    Object.keys(allSpellRefs).forEach((spell) => {
      this.spells[spell] = new allSpellRefs[spell](this.game);
      delete baseSpellList[spell];
    });

    Object.keys(baseSpellList).forEach((otherSpellName) => {
      this.spells[otherSpellName] = new Spell(this.game);
    });

    this.dazedDivisor =
      this.game.contentManager.getGameSetting('spell', 'dazedDivisor') ?? 2;
    this.encumberedDivisor =
      this.game.contentManager.getGameSetting('spell', 'encumberedDivisor') ??
      2;
    this.skillGainedPerCast =
      this.game.contentManager.getGameSetting('spell', 'encumberedDivisor') ??
      1;
    this.skillGainedPerAOECast =
      this.game.contentManager.getGameSetting('spell', 'encumberedDivisor') ??
      0.01;
  }

  // get the raw YML spell data
  public getSpellData(key: string): ISpellData {
    return this.game.contentManager.getSpell(key);
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

    const castSkill =
      this.game.contentManager.getClassConfigSetting<'castSkill'>(
        caster.baseClass,
        'castSkill',
      );

    const isStatic = spellData.spellMeta?.staticPotency;

    let skillsToAverage: Skill[] = [castSkill] as Skill[];
    if (!castSkill) {
      if (caster.items.equipment[ItemSlot.RightHand]) {
        const { type, secondaryType } = this.game.itemHelper.getItemProperties(
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
      sum(
        skillsToAverage.map(
          (skill) => this.game.characterHelper.getSkillLevel(caster, skill) + 1,
        ),
      ) / skillsToAverage.length,
    );

    if (spellData.spellMeta.useSkillAsPotency) {
      return Math.floor(baseSkillValue * this.getPotencyMultiplier(spellData));
    }

    const baseStat = this.game.characterHelper.getStat(
      caster,
      this.game.characterHelper.castStat(caster),
    );
    const statMult = caster ? baseStat : 1;

    const bonusRolls = isStatic
      ? 0
      : random(spellData.bonusRollsMin ?? 0, spellData.bonusRollsMax ?? 0);

    const basePotency = this.game.diceRollerHelper.diceRoll(
      baseSkillValue + bonusRolls,
      statMult,
    );
    let retPotency = isStatic
      ? (baseSkillValue + bonusRolls) * statMult
      : basePotency;

    let maxMult = 1;
    (spellData.skillMultiplierChanges || []).forEach(([baseSkill, mult]) => {
      if (baseSkillValue < baseSkill) return;
      maxMult = mult;
    });

    retPotency *= maxMult;
    retPotency *= this.getPotencyMultiplier(spellData);

    if (spellData.spellMeta.doesAttack) {
      const arcaneHunger = this.game.effectHelper.getEffect(
        caster,
        'ArcaneHunger',
      );
      if (arcaneHunger) {
        const charges = arcaneHunger.effectInfo.charges ?? 0;
        retPotency += retPotency * (charges / 10);
      }
    }

    // encumberance cuts potency exactly in half
    if (this.game.effectHelper.hasEffect(caster, 'Encumbered')) {
      retPotency /= this.encumberedDivisor;
    }

    if (
      this.game.effectHelper.hasEffect(caster, 'Dazed') &&
      this.game.diceRollerHelper.XInOneHundred(
        this.game.effectHelper.getEffectPotency(caster, 'Dazed'),
      )
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
    const skillGain =
      this.game.contentManager.getClassConfigSetting<'castSkill'>(
        caster.baseClass,
        'castSkill',
      );
    if (!skillGain) return;

    const skillLevel = this.game.calculatorHelper.calcSkillLevelForCharacter(
      caster,
      skillGain,
    );
    if (skillLevel > (spellData.maxSkillForGain ?? 0)) return;

    const skillsFlagged =
      this.game.effectHelper.hasEffect(caster, 'Hidden') &&
      skillGain !== Skill.Thievery
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

    if (target && this.game.characterHelper.isDead(target)) return;

    const spellData = this.getSpellData(spell);
    if (!spellData) {
      this.game.logger.error(
        'SpellManager',
        new Error(`Tried to cast invalid spell ${spell}.`),
      );
      return;
    }

    const spellRef = this.getSpell(spell);
    if (!spellRef) {
      this.game.logger.error(
        'SpellManager',
        new Error(`Tried to ref invalid spell ${spell}.`),
      );
      return;
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
      noHostileTarget,
      bonusAgro,
      canBeResisted,
      range,
      fizzledBy,
    } = spellData.spellMeta;

    if (target && fizzledBy && fizzledBy.length > 0) {
      if (
        fizzledBy.some((effectToFizzleOn) =>
          this.game.effectHelper.hasEffect(target, effectToFizzleOn),
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
      !this.game.characterHelper.isPlayer(target)
    ) {
      this.game.messageHelper.sendSimpleMessage(
        caster,
        'You cannot target that creature with this spell!',
      );
      return;
    }

    // spell can fail sometimes, usually this only happens when doing a melee attack w/ weapon that casts spells
    const chance = override.chance || 100;
    if (!this.game.diceRollerHelper.XInOneHundred(chance)) return;

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
        this.game.diceRollerHelper.OneToStat(
          caster,
          this.game.characterHelper.castStat(caster),
        ) +
        (resistLowerTrait
          ? this.game.traitHelper.traitLevelValue(caster, resistLowerTrait)
          : 0);
      const targetRoll =
        this.game.diceRollerHelper.OneToStat(target, Stat.WIL) +
        this.game.characterHelper.getStat(target, Stat.SavingThrow);

      if (targetRoll > casterRoll) {
        this.game.messageHelper.sendSimpleMessage(
          caster,
          `${target.name} resisted your spell!`,
        );
        return;
      }
    }

    // send a message to the caster if they're not the target
    if (caster !== target && caster && casterMessage) {
      this.game.messageHelper.sendLogMessageToPlayer(caster, {
        message: casterMessage,
        sfx: casterSfx as SoundEffect,
      });
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
            (1 +
              this.game.traitHelper.traitLevelValue(
                caster,
                'EffectiveSupporter',
              )),
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
        this.game.effectManager.getEffectData(spell),
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
      numCasts += this.game.traitHelper.traitLevelValue(
        caster,
        extraAttackTrait,
      );
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
          damageClass: spellData.damageClass || DamageClass.Energy,
          spellData,
        });
      }

      if (target && doesHeal) {
        this.game.combatHelper.magicalAttack(caster, target, {
          atkMsg: spellData.spellMeta.casterAttackMessage || '',
          defMsg: spellData.spellMeta.targetAttackMessage || '',
          sfx: i === 0 ? SoundEffect.SpellHeal : undefined,
          damage: -potency,
          damageClass: spellData.damageClass || DamageClass.Heal,
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

    // check for arcane hunger
    if (caster && spellData.spellMeta.doesAttack) {
      const arcaneHungerSet = this.game.traitHelper.traitLevelValue(
        caster,
        'ArcaneHunger',
      );

      if (arcaneHungerSet > 0) {
        const existingEffect = this.game.effectHelper.getEffect(
          caster,
          'ArcaneHunger',
        );

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
}
