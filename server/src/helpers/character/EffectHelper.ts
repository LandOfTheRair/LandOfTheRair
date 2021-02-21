import { Injectable } from 'injection-js';
import { isArray, isString, merge } from 'lodash';
import uuid from 'uuid/v4';

import { DeepPartial, ICharacter, IStatusEffect, IStatusEffectData, Stat } from '../../interfaces';
import { BaseService } from '../../models/BaseService';

@Injectable()
export class EffectHelper extends BaseService {

  public init() {}

  // do whatever the effect does by ticking it
  public tickEffect(character: ICharacter, effect: IStatusEffect): void {
    const { effectMeta: meta } = this.game.effectManager.getEffectData(effect.effectName);
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
    const effectData: IStatusEffectData = merge({}, this.game.effectManager.getEffectData(effectName), modifyEffectInfo);
    const { type, extra, duration } = effectData.effect;

    const effect: IStatusEffect = {
      uuid: uuid(),
      tooltip: effectData.tooltip.desc,
      effectName,
      endsAt: duration === -1 ? -1 : Date.now() + (1000 * duration),
      effectInfo: extra || {},
      effectRef: effectData.effectMeta.effectRef,
      sourceName: ''
    };

    // environments doing damage or effects would get this
    if (isString(source)) {
      effect.sourceName = source as string;

    // but most of the time a friendly monster will be afflicting us with something
    } else {
      effect.sourceName = (source as ICharacter).name;
      effect.sourceUUID = (source as ICharacter).uuid;

    }

    // for now, we always overwrite when uniques and not worn
    if (effect.effectInfo.unique) {

      const priorEffect = character.effects[type].find(e => e.effectName === effect.effectName);

      // if the effect is permanent, we do _not_ overwrite, unless we're also permanent
      if (effect.endsAt === -1 || (priorEffect && priorEffect.endsAt !== -1)) {
        character.effects[type] = character.effects[type].filter(e => e.effectName !== effect.effectName);
      }
    }

    if (type !== 'useonly') {
      character.effects._hash = character.effects._hash || {};
      character.effects._hash[effect.effectName] = true;
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
    const effectData = this.game.effectManager.getEffectData(effect.effectName);
    const { type } = effectData.effect;

    character.effects[type] = character.effects[type].filter(e => e.uuid !== effect.uuid);

    // in case you have multiples of a spell cast on you
    if (!character.effects[type].find(x => x.effectName === effect.effectName)) {
      delete character.effects._hash[effect.effectName];
    }

    // recalculate stats when removed, before calling unapply or destroy
    this.game.characterHelper.calculateStatTotals(character);

    this.game.effectManager.effectUnapply(effect.effectName, character, effect);
    this.game.effectManager.effectDestroy(effect.effectName, character, effect);
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

    const meta = this.game.effectManager.getEffectData(effect.effectName);
    if (!meta.effect.extra.canRemove) return;

    this.removeEffect(character, effect);
  }

  // remove all effects
  public clearEffectsForDeath(character: ICharacter): void {
    Object.values(character.effects).forEach(effectContainer => {
      if (!isArray(effectContainer)) return;

      effectContainer.forEach(effect => {
        const meta = this.game.effectManager.getEffectData(effect.effectName);
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
    return char.effects?._hash?.[effName];
  }

}
