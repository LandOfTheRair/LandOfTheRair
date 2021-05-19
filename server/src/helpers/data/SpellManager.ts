import { Injectable } from 'injection-js';
import { cloneDeep } from 'lodash';

import { BaseClass, BaseSpell, DamageClass, ICharacter, IItemEffect,
  IMacroCommandArgs, ISpellData, IStatusEffectData, Skill, SoundEffect, Stat } from '../../interfaces';

import { Player } from '../../models';
import { BaseService } from '../../models/BaseService';
import * as allSpellRefs from '../game/spells';

@Injectable()
export class SpellManager extends BaseService {

  private spells: Record<string, BaseSpell> = {};

  // initialize all of the spells that exist
  public init() {
    Object.keys(allSpellRefs).forEach(spell => {
      this.spells[spell] = new allSpellRefs[spell](this.game);
    });
  }

  // get the raw YML spell data
  public getSpellData(key: string): ISpellData {
    return this.game.contentManager.getSpell(key);
  }

  // get the ref to the spell for casting
  public getSpell(key: string): BaseSpell {
    return this.spells[key];
  }

  // gain skill for casting a spell
  private gainSkill(caster: ICharacter, spellData: ISpellData): void {
    const skills = {
      [BaseClass.Healer]: Skill.Restoration,
      [BaseClass.Mage]: Skill.Conjuration,
      [BaseClass.Thief]: Skill.Thievery
    };

    const skillGain = skills[caster.baseClass];
    if (!skillGain) return;

    const skillLevel = this.game.calculatorHelper.calcSkillLevelForCharacter(caster, skillGain);
    if (skillLevel > spellData.maxSkillForGain ?? 0) return;

    const skillsFlagged = this.game.effectHelper.hasEffect(caster, 'Hidden') && skillGain !== Skill.Thievery
      ? [skillGain, Skill.Thievery]
      : [skillGain];

    this.game.playerHelper.flagSkill(caster as Player, skillsFlagged);
    this.game.playerHelper.gainCurrentSkills(caster as Player, 1);
  }

  private canCastSpell(character: ICharacter, spellName: string): boolean {
    return Date.now() > (character.spellCooldowns?.[spellName] ?? 0);
  }

  private cooldownSpell(character: ICharacter, spellName: string, spellData: ISpellData): void {
    if (!spellData.cooldown) return;

    character.spellCooldowns = character.spellCooldowns || {};
    character.spellCooldowns[spellName] = Date.now() + (1000 * (spellData.cooldown ?? 0));
  }

  // cast a spell!
  public castSpell(
    spell: string,
    caster: ICharacter|null = null,
    target: ICharacter|null = null,
    override: Partial<IItemEffect> = {},
    callbacks?: any,
    originalArgs?: Partial<IMacroCommandArgs>,
    targetsPosition?: { x: number; y: number; map: string }
  ): void {
    if (!caster && !target) return;

    if (target && this.game.characterHelper.isDead(target)) return;

    const spellData = this.getSpellData(spell);
    if (!spellData) {
      this.game.logger.error('SpellManager', new Error(`Tried to cast invalid spell ${spell}.`));
      return;
    }

    const spellRef = this.getSpell(spell);
    if (!spellRef) {
      this.game.logger.error('SpellManager', new Error(`Tried to ref invalid spell ${spell}.`));
      return;
    }

    // send messages to caster/target where applicable
    const { casterMessage, casterSfx, targetMessage, targetSfx, resistLowerTrait, creatureSummoned, extraAttackTrait,
      doesAttack, doesHeal, doesOvertime, noHostileTarget, bonusAgro, canBeResisted, range } = spellData.spellMeta;

    // buff spells can't be cast on hostiles
    if (caster && target && noHostileTarget && this.game.targettingHelper.checkTargetForHostility(caster, target)) {
      this.game.messageHelper.sendSimpleMessage(caster, 'You cannot target that creature with this spell!');
      return;
    }

    // spell can fail sometimes, usually this only happens when doing a melee attack w/ weapon that casts spells
    const chance = override.chance || 100;
    if (!this.game.diceRollerHelper.XInOneHundred(chance)) return;

    // gain skill for the spell cast, but only if you're actually casting it
    if (caster && chance === 100) {
      if (!this.canCastSpell(caster, spell)) {
        this.game.messageHelper.sendSimpleMessage(caster, 'That spell is still cooling down!');
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
      const casterRoll = this.game.diceRollerHelper.OneToStat(caster, this.game.characterHelper.castStat(caster))
                       + (resistLowerTrait ? this.game.traitHelper.traitLevelValue(caster, resistLowerTrait) : 0);
      const targetRoll = this.game.diceRollerHelper.OneToStat(target, Stat.WIL)
                       + this.game.traitHelper.traitLevelValue(target, 'InternalFortitude')
                       + this.game.traitHelper.traitLevelValue(target, 'AncientFortitude');

      if (targetRoll > casterRoll) {
        this.game.messageHelper.sendSimpleMessage(caster, `${target.name} resisted your spell!`);
        return;
      }

    }

    // send a message to the caster if they're not the target
    if (caster !== target && caster && casterMessage) {
      this.game.messageHelper.sendLogMessageToPlayer(caster, { message: casterMessage, sfx: casterSfx as SoundEffect });
    }

    // send a message to the target
    if (target && targetMessage) {
      this.game.messageHelper.sendLogMessageToPlayer(target, { message: targetMessage, sfx: targetSfx as SoundEffect });
    }

    // try to add a buff effect if needed
    if (doesOvertime && target) {
      const spellEffInfo = spellRef.getOverrideEffectInfo(caster, target, spellData);
      if (caster && noHostileTarget && spellEffInfo.effect?.duration) {
        spellEffInfo.effect.duration = Math.floor(
          spellEffInfo.effect.duration * (1 + this.game.traitHelper.traitLevelValue(caster, 'EffectiveSupporter'))
        );
      }

      this.game.effectHelper.addEffect(target, caster ?? 'somebody', spell, spellEffInfo);
    }

    // try to summon creatures if possible
    if (creatureSummoned && target) {
      const spellEffInfo = spellRef.getOverrideEffectInfo(caster, caster, spellData);
      const ffEffectData: IStatusEffectData = cloneDeep(this.game.effectManager.getEffectData(spell));
      ffEffectData.effect.duration = spellEffInfo.effect?.duration ?? 10;
      ffEffectData.effect.extra.potency = spellEffInfo.effect?.extra?.potency ?? 10;
      ffEffectData.effect.extra.effectIcon = ffEffectData.tooltip.icon;
      ffEffectData.effect.extra.summonCreatures = spellData.spellMeta.creatureSummoned ?? ['Mage Summon Deer'];

      this.game.effectHelper.addEffect(target, caster ?? 'somebody', 'FindFamiliar', ffEffectData);
    }

    // cast the spell however many number of times
    let numCasts = 1;
    if (caster && extraAttackTrait) numCasts += this.game.traitHelper.traitLevelValue(caster, extraAttackTrait);

    for (let i = 0; i < numCasts; i++) {

      const potency = override.potency ?? spellRef.getPotency(caster, target, spellData);
      const spellRange = override.range ?? range ?? 0;
      const duration = override.duration ?? 0;

      if (target && doesAttack) {
        this.game.combatHelper.magicalAttack(caster, target, {
          atkMsg: spellData.spellMeta.casterAttackMessage,
          defMsg: spellData.spellMeta.targetAttackMessage,
          sfx: SoundEffect.CombatHitSpell,
          damage: potency,
          damageClass: spellData.damageClass || DamageClass.Energy,
          spellData
        });
      }

      if (target && doesHeal) {
        this.game.combatHelper.magicalAttack(caster, target, {
          atkMsg: spellData.spellMeta.casterAttackMessage,
          defMsg: spellData.spellMeta.targetAttackMessage,
          sfx: SoundEffect.SpellHeal,
          damage: -potency,
          damageClass: spellData.damageClass || DamageClass.Heal,
          spellData
        });
      }

      spellRef.cast(caster, target, {
        potency, range: spellRange, duration, callbacks, spellData, originalArgs,
        ...(targetsPosition || {})
      });
    }
  }

}
