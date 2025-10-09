import { Injectable } from 'injection-js';
import { isArray, isString, merge } from 'lodash';
import uuid from 'uuid/v4';

import { formatEffectMessage, hasEffect } from '@lotr/effects';
import type {
  DamageArgs,
  DeepPartial,
  ICharacter,
  IStatusEffect,
  IStatusEffectData,
} from '@lotr/interfaces';
import { Allegiance } from '@lotr/interfaces';
import { consoleError } from '@lotr/logger';
import { BaseService } from '../../models/BaseService';

@Injectable()
export class EffectHelper extends BaseService {
  public init() {}

  // do whatever the effect does by ticking it
  public tickEffect(character: ICharacter, effect: IStatusEffect): void {
    const effectData = this.game.effectManager.getEffectData(
      effect.effectRef || effect.effectName,
      `TE:${character.name}`,
    );
    if (!effectData || !effectData.effectMeta.effectRef) return;

    this.game.effectManager.effectTick(effect.effectName, character, effect);
  }

  // check to see if any effects have expired
  public tickEffects(character: ICharacter): void {
    const now = Date.now();

    Object.values(character.effects).forEach((effectContainer) => {
      if (!isArray(effectContainer)) return;

      effectContainer.forEach((effect) => {
        this.tickEffect(character, effect);
        if (effect.endsAt > now || effect.endsAt === -1) return;

        this.removeEffect(character, effect, true);
      });
    });
  }

  // add a new effect
  public addEffect(
    character: ICharacter,
    source: string | { name: string; uuid: string },
    effectName: string,
    modifyEffectInfo: DeepPartial<IStatusEffectData> = {},
  ): void {
    if (
      character.allegiance === Allegiance.NaturalResource &&
      effectName !== 'Attribute'
    ) {
      return;
    }

    if (!effectName) {
      consoleError(
        'EffectHelper:AddEffect',
        new Error('Attempting to create an undefined effect'),
      );
      return;
    }

    const rawEffectData = this.game.effectManager.getEffectData(
      effectName,
      `AE:${character.name}`,
    );
    if (!rawEffectData) {
      consoleError(
        'EffectHelper:AddEffect',
        new Error(`Could not find an effect ${effectName}.`),
      );
      return;
    }

    const effectData: IStatusEffectData = merge(
      {},
      rawEffectData,
      modifyEffectInfo,
    );
    const { type, extra, duration } = effectData.effect;
    const { recentlyRef, noStack } = effectData.effectMeta;

    // if the effect can't stack we won't let it (prevents things like chain stun)
    if (noStack && hasEffect(character, effectName)) {
      return;
    }

    // if this effect has a recently associated with it, we do not apply if they have that
    if (recentlyRef && hasEffect(character, recentlyRef)) {
      return;
    }

    const effect: IStatusEffect = {
      uuid: uuid(),
      tooltip: formatEffectMessage(
        effectData.tooltip.desc ?? 'No info.',
        effectData,
      ),
      effectName,
      endsAt: duration === -1 ? -1 : Date.now() + 1000 * duration,
      effectInfo: extra || {},
      effectRef: effectData.effectMeta.effectRef || '',
      sourceName: '',
    };

    if (effectData.tooltip.name) {
      effect.effectInfo.tooltipName = effectData.tooltip.name;
    }

    if (effectData.effectMeta?.effectRef) {
      effect.effectName = this.game.effectManager.getEffectName(
        character,
        effect,
      );
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
      const priorEffect = character.effects[type].find(
        (e) =>
          e.effectName === effect.effectName &&
          (effect.effectInfo.unique
            ? true
            : e.sourceUUID === effect.sourceUUID),
      );

      // if the effect is permanent, we do _not_ overwrite, at all
      if (
        priorEffect &&
        priorEffect.endsAt === -1 &&
        !priorEffect.effectInfo.charges
      ) {
        return;
      }

      character.effects[type] = character.effects[type].filter(
        (e) => e.effectName !== effect.effectName,
      );

      character.effects._hash = character.effects._hash || {};
      character.effects._hash[effect.effectName] = effect;
      character.effects[type].push(effect);
    }

    // any stat changes must be added in effectCreate to be counted immediately
    this.game.effectManager.effectCreate(effectName, character, effect);
    this.game.characterHelper.calculateStatTotals(character);

    // effect apply hook is for after create
    this.game.effectManager.effectApply(effectName, character, effect);

    const defaultTooltip = formatEffectMessage(
      effectData.tooltip?.desc ?? '',
      effectData,
    );
    if (defaultTooltip) {
      effect.tooltip = defaultTooltip;
    }
  }

  // remove a stale or removed effect
  public removeEffectByName(character: ICharacter, effectName: string): void {
    const effectData = this.game.effectManager.getEffectData(
      effectName,
      `REBN:${character.name}`,
    );
    if (!effectData) {
      consoleError(
        'EffectHelper',
        new Error(
          `Effect ${effectName} cannot be removed as no data could be found.`,
        ),
      );
      return;
    }

    const { type } = effectData.effect;

    const foundEffect = character.effects[type].find(
      (x) => x.effectName === effectName,
    );
    if (!foundEffect) return;

    this.removeEffect(character, foundEffect);
  }

  // remove a stale or removed effect
  public removeEffect(
    character: ICharacter,
    effect: IStatusEffect,
    shouldExpire = false,
  ): void {
    const effectData = this.game.effectManager.getEffectData(
      effect.effectRef || effect.effectName,
      `RE:${character.name}`,
    );
    if (!effectData) {
      consoleError(
        'EffectHelper',
        new Error(
          `Effect ${JSON.stringify(effect)} cannot be removed as no data could be found.`,
        ),
      );
      return;
    }

    const { type } = effectData.effect;
    const { recentlyRef } = effectData.effectMeta;

    character.effects[type] = character.effects[type].filter(
      (e) => e.uuid !== effect.uuid,
    );

    // in case you have multiples of a spell cast on you
    if (
      !character.effects[type].find((x) => x.effectName === effect.effectName)
    ) {
      delete character.effects._hash[effect.effectName];
    }

    // recalculate stats when removed, before calling unapply or destroy
    this.game.characterHelper.calculateStatTotals(character);

    this.game.effectManager.effectUnapply(effect.effectName, character, effect);

    if (shouldExpire) {
      this.game.effectManager.effectExpire(
        effect.effectName,
        character,
        effect,
      );
    }

    // if this spell has a recently associated with it, we apply it now
    if (
      recentlyRef &&
      !effect.effectInfo.disableRecently &&
      effect.endsAt !== -1
    ) {
      this.addEffect(character, '', recentlyRef);
    }
  }

  public removeEffectManually(
    character: ICharacter,
    effectNameOrUUID: string,
    force = false,
  ): void {
    let effect!: IStatusEffect;

    Object.values(character.effects).forEach((effectContainer) => {
      if (!isArray(effectContainer)) return;

      effectContainer.forEach((checkEffect: IStatusEffect) => {
        if (effect) return;
        if (
          checkEffect.effectName !== effectNameOrUUID &&
          checkEffect.uuid !== effectNameOrUUID
        ) {
          return;
        }
        if (!force && checkEffect.endsAt === -1) return;

        effect = checkEffect;
      });
    });

    if (!effect) return;

    const meta = this.game.effectManager.getEffectData(
      effect.effectRef || effect.effectName,
      `REM:${character.name}`,
    );
    if (!meta || !meta.effect.extra.canRemove) return;

    this.removeEffect(character, effect);
  }

  // remove all effects
  public clearEffectsForDeath(character: ICharacter): void {
    Object.values(character.effects).forEach((effectContainer) => {
      if (!isArray(effectContainer)) return;

      effectContainer.forEach((effect) => {
        const meta = this.game.effectManager.getEffectData(
          effect.effectRef || effect.effectName,
          `CEFD:${character.name}`,
        );
        if (meta.effect.extra.persistThroughDeath) return;

        this.removeEffect(character, effect);
      });
    });
  }

  // modify incoming damage based on incoming effects
  public modifyIncomingDamage(
    char: ICharacter,
    attacker: ICharacter | undefined,
    damageArgs: DamageArgs,
  ): number {
    let currentDamage = Math.floor(damageArgs.damage);

    Object.values(char.effects._hash).forEach((eff) => {
      const ref = this.game.effectManager.getEffectRef(
        eff.effectRef || eff.effectName,
      );
      if (!ref) return;

      if (ref.incoming) {
        currentDamage = Math.floor(
          ref.incoming(eff, char, attacker, damageArgs, currentDamage),
        );
      }
    });

    return currentDamage;
  }

  // handle outgoing effects (damage bonuses, etc) effects
  public handleOutgoingEffects(
    char: ICharacter,
    attacker: ICharacter,
    damageArgs: DamageArgs,
  ): void {
    Object.values(char.effects._hash).forEach((eff) => {
      const ref = this.game.effectManager.getEffectRef(
        eff.effectRef || eff.effectName,
      );

      ref?.outgoing?.(eff, char, attacker, damageArgs);
    });
  }

  // check for similar effects based on a query (such as for stances and imbues)
  public hasSimilarEffects(
    char: ICharacter,
    query: string,
    except?: string,
  ): boolean {
    return Object.keys(char.effects._hash).some(
      (effectName) =>
        effectName.includes(query) ||
        char.effects._hash[effectName]?.effectInfo?.unique === query ||
        (except ? effectName === except : false),
    );
  }

  // remove similar effects based on a query (such as for stances and imbues)
  public removeSimilarEffects(
    char: ICharacter,
    query: string,
    except: string,
    cancelPerms = false,
    force = false,
  ): void {
    Object.keys(char.effects._hash).forEach((effectName) => {
      if (
        char.effects._hash[effectName]?.effectInfo?.unique === query &&
        effectName !== except
      ) {
        this.removeEffect(char, char.effects._hash[effectName]);
        return;
      }

      if (
        effectName === except ||
        !effectName.includes(query) ||
        (!cancelPerms && char.effects._hash[effectName].endsAt === -1) ||
        force
      ) {
        return;
      }

      this.removeEffect(char, char.effects._hash[effectName]);
    });
  }
}
