import { Injectable } from 'injection-js';
import { isArray, isString, merge } from 'lodash';
import uuid from 'uuid/v4';

import { BuffType, DamageArgs, DeepPartial, ICharacter, IStatusEffect, IStatusEffectData, Stat } from '../../interfaces';
import { BaseService } from '../../models/BaseService';

@Injectable()
export class EffectHelper extends BaseService {

  public init() {}

  private formatEffectMessage(message: string, effectData: IStatusEffectData): string {
    return (message || '')
      .split('%potency').join(effectData.effect.extra.potency?.toLocaleString());
  }

  // do whatever the effect does by ticking it
  public tickEffect(character: ICharacter, effect: IStatusEffect): void {
    const { effectMeta: meta } = this.game.effectManager.getEffectData(effect.effectRef ?? effect.effectName);
    if (!meta.effectRef) return;

    this.game.effectManager.effectTick(effect.effectName, character, effect);
  }

  // check to see if any effects have expired
  public tickEffects(character: ICharacter): void {
    const now = Date.now();

    Object.values(character.effects).forEach(effectContainer => {
      if (!isArray(effectContainer)) return;

      effectContainer.forEach(effect => {
        this.tickEffect(character, effect);
        if (effect.endsAt > now || effect.endsAt === -1) return;

        this.removeEffect(character, effect);
      });
    });
  }

  // add a new effect
  public addEffect(
    character: ICharacter,
    source: string|ICharacter,
    effectName: string,
    modifyEffectInfo: DeepPartial<IStatusEffectData> = {}
  ): void {
    const rawEffectData = this.game.effectManager.getEffectData(effectName);
    if (!rawEffectData) {
      this.game.logger.error('EffectHelper:AddEffect', `Could not find an effect ${effectName}.`);
      return;
    }

    const effectData: IStatusEffectData = merge({}, rawEffectData, modifyEffectInfo);
    const { type, extra, duration } = effectData.effect;
    const { recentlyRef } = effectData.effectMeta;

    // if this effect has a recently associated with it, we do not apply if they have that
    if (recentlyRef && this.hasEffect(character, recentlyRef)) {
      return;
    }

    const effect: IStatusEffect = {
      uuid: uuid(),
      tooltip: this.formatEffectMessage(effectData.tooltip.desc, effectData),
      effectName,
      endsAt: duration === -1 ? -1 : Date.now() + (1000 * duration),
      effectInfo: extra || {},
      effectRef: effectData.effectMeta.effectRef,
      sourceName: ''
    };

    if (effectData.effectMeta?.effectRef) {
      effect.effectName = this.game.effectManager.getEffectName(character, effect);
    }

    // environments doing damage or effects would get this
    if (isString(source)) {
      effect.sourceName = source as string;

    // but most of the time a friendly monster will be afflicting us with something
    } else {
      effect.sourceName = (source as ICharacter).name;
      effect.sourceUUID = (source as ICharacter).uuid;

    }

    if (type !== 'useonly') {

      // for now, we always overwrite when uniques and not worn
      // but still only one cast per target per caster (so you can't stack 6 poison on the same target)
      const priorEffect = character.effects[type].find(e => e.effectName === effect.effectName
                                                         && effect.effectInfo.unique ? true : e.sourceUUID === effect.sourceUUID);

      // if the effect is permanent, we do _not_ overwrite, unless we're also permanent
      if (effect.endsAt === -1 || (priorEffect && priorEffect.endsAt !== -1)) {
        character.effects[type] = character.effects[type].filter(e => e.effectName !== effect.effectName);
      }

      character.effects._hash = character.effects._hash || {};
      character.effects._hash[effect.effectName] = effect;
      character.effects[type].push(effect);
    }

    // any stat changes must be added in effectCreate to be counted immediately
    this.game.effectManager.effectCreate(effectName, character, effect);
    this.game.characterHelper.calculateStatTotals(character);

    // effect apply hook is for after create
    this.game.effectManager.effectApply(effectName, character, effect);
  }

  // remove a stale or removed effect
  public removeEffectByName(character: ICharacter, effectName: string): void {
    const effectData = this.game.effectManager.getEffectData(effectName);
    const { type } = effectData.effect;

    const foundEffect = character.effects[type].find(x => x.effectName === effectName);
    if (!foundEffect) return;

    this.removeEffect(character, foundEffect);
  }

  // remove a stale or removed effect
  public removeEffect(character: ICharacter, effect: IStatusEffect): void {
    const effectData = this.game.effectManager.getEffectData(effect.effectRef ?? effect.effectName);
    const { type } = effectData.effect;
    const { recentlyRef } = effectData.effectMeta;

    character.effects[type] = character.effects[type].filter(e => e.uuid !== effect.uuid);

    // in case you have multiples of a spell cast on you
    if (!character.effects[type].find(x => x.effectName === effect.effectName)) {
      delete character.effects._hash[effect.effectName];
    }

    // recalculate stats when removed, before calling unapply or destroy
    this.game.characterHelper.calculateStatTotals(character);

    this.game.effectManager.effectUnapply(effect.effectName, character, effect);
    this.game.effectManager.effectDestroy(effect.effectName, character, effect);

    // if this spell has a recently associated with it, we apply it now
    if (recentlyRef) {
      this.addEffect(character, '', recentlyRef);
    }
  }

  public removeEffectManually(character: ICharacter, effectNameOrUUID: string): void {

    let effect!: IStatusEffect;

    Object.values(character.effects).forEach(effectContainer => {
      if (!isArray(effectContainer)) return;

      effectContainer.forEach(checkEffect => {
        if (effect) return;
        if (checkEffect.effectName !== effectNameOrUUID && checkEffect.uuid !== effectNameOrUUID) return;

        effect = checkEffect;
      });
    });

    if (!effect) return;

    const meta = this.game.effectManager.getEffectData(effect.effectRef ?? effect.effectName);
    if (!meta.effect.extra.canRemove) return;

    this.removeEffect(character, effect);
  }

  // remove all effects
  public clearEffectsForDeath(character: ICharacter): void {
    Object.values(character.effects).forEach(effectContainer => {
      if (!isArray(effectContainer)) return;

      effectContainer.forEach(effect => {
        const meta = this.game.effectManager.getEffectData(effect.effectRef ?? effect.effectName);
        if (meta.effect.extra.persistThroughDeath) return;

        this.removeEffect(character, effect);
      });
    });
  }

  // get total effect stat bonuses
  public effectStatBonuses(character: ICharacter): Partial<Record<Stat, number>> {

    const stats: Partial<Record<Stat, number>> = {};

    Object.values(character.effects).forEach(effectContainer => {
      if (!isArray(effectContainer)) return;

      effectContainer.forEach((checkEffect: IStatusEffect) => {
        const statBoosts = checkEffect.effectInfo.statChanges;
        Object.keys(statBoosts || {}).forEach(stat => {
          stats[stat] = stats[stat] || 0;
          stats[stat] += statBoosts?.[stat] ?? 0;
        });
      });
    });

    return stats;
  }

  // check if someone has an effect
  public hasEffect(char: ICharacter, effName: string): boolean {
    return !!char.effects?._hash?.[effName];
  }

  // get the potency of an effect
  public getEffectPotency(char: ICharacter, effName: string): number {
    return char.effects?._hash?.[effName]?.effectInfo.potency ?? 0;
  }

  // modify incoming damage based on incoming effects
  public modifyIncomingDamage(char: ICharacter, attacker: ICharacter | null, damageArgs: DamageArgs): number {
    let currentDamage = damageArgs.damage;

    char.effects.incoming.forEach(eff => {
      const ref = this.game.effectManager.getEffectRef(eff.effectRef || eff.effectName);
      if (!ref) return;

      if (ref.incoming) {
        currentDamage = ref.incoming(eff, char, attacker, damageArgs, currentDamage);
      }
    });

    return currentDamage;
  }

  public dispellableEffects(char: ICharacter): IStatusEffect[] {
    return char.effects[BuffType.Buff].filter(x => {
      if (x.endsAt === -1) return false;
      if (!x.effectInfo.canRemove) return false;

      return true;
    });
  }

}
