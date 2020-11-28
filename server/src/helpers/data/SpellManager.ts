import { Injectable } from 'injection-js';
import { BaseClass, BaseService, BaseSpell, DamageClass, ICharacter, IItemEffect, ISpellData, Skill, SoundEffect } from '../../interfaces';

import * as allSpells from '../../../content/_output/spells.json';
import { Player } from '../../models';
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
    return allSpells[key];
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

    this.game.playerHelper.flagSkill(caster as Player, [skillGain]);
    this.game.playerHelper.gainSkill(caster as Player, skillGain, 1);
  }

  // cast a spell!
  public castSpell(
    spell: string,
    caster: ICharacter|null = null,
    target: ICharacter,
    override: Partial<IItemEffect> = {},
    callbacks: any
  ): void {
    if (!caster && !target) return;

    const spellData = this.getSpellData(spell);
    if (!spellData) {
      this.game.logger.error(`SpellManager`, new Error(`Tried to cast invalid spell ${spell}.`));
      return;
    }

    const spellRef = this.getSpell(spell);
    if (!spellRef) {
      this.game.logger.error(`SpellManager`, new Error(`Tried to ref invalid spell ${spell}.`));
      return;
    }

    // spell can fail sometimes, usually this only happens when doing a melee attack w/ weapon that casts spells
    const chance = override.chance || 100;
    if (!this.game.diceRollerHelper.XInOneHundred(chance)) return;

    const potency = override.potency || spellRef.getPotency(caster, target, spellData);
    const range = override.range || 0;
    const duration = override.duration || 0;

    // gain skill for the spell cast
    if (caster) {
      this.gainSkill(caster, spellData);
    }

    // send messages to caster/target where applicable
    const { casterMessage, casterSfx, targetMessage, targetSfx } = spellData.meta;

    if (caster !== target && caster && casterMessage) {
      this.game.messageHelper.sendLogMessageToPlayer(caster, { message: casterMessage, sfx: casterSfx as SoundEffect });
    }

    if (target && targetMessage) {
      this.game.messageHelper.sendLogMessageToPlayer(target, { message: targetMessage, sfx: targetSfx as SoundEffect });
    }

    if (spellData.meta.doesAttack) {
      this.game.combatHelper.magicalAttack(caster, target, {
        atkMsg: spellData.meta.casterAttackMessage,
        defMsg: spellData.meta.targetAttackMessage,
        sfx: SoundEffect.CombatHitSpell,
        damage: potency,
        damageClass: spellData.damageClass || DamageClass.Energy,
        spellData
      });
    }

    spellRef.cast(caster, target, { potency, range, duration, callbacks, spellData });
  }

}
