import { Injectable } from 'injection-js';
import { isString } from 'lodash';
import uuid from 'uuid/v4';

import { BaseService, ICharacter, IStatusEffect, IStatusEffectInfo } from '../../interfaces';

import * as allEffects from '../../../content/_output/effect-data.json';

@Injectable()
export class EffectHelper extends BaseService {

  public init() {}

  // do whatever the effect does, not sure how this will work yet
  public tickEffect(character: ICharacter, effect: IStatusEffect): void {

  }

  // check to see if any effects have expired
  public tickEffects(character: ICharacter): void {
    const now = Date.now();

    Object.values(character.effects).forEach(effectContainer => {
      effectContainer.forEach(effect => {
        this.tickEffect(character, effect);
        if (effect.endsAt > now || effect.endsAt === -1) return;

        this.removeEffect(character, effect);
      });
    });
  }

  private getEffectData(effectName: string) {
    const effectData = allEffects[effectName];
    if (!effectData) throw new Error(`No effect ${effectName} exists.`);

    return effectData;
  }

  // add a new effect
  public addEffect(
    character: ICharacter,
    source: string|ICharacter,
    effectName: string,
    effectInfo: Partial<IStatusEffectInfo> = {},
    duration = 600
  ): void {
    const effectData = this.getEffectData(effectName);
    const { type, extra } = effectData.effect;

    const effect: IStatusEffect = {
      uuid: uuid(),
      tooltip: effectData.tooltip.desc,
      effectName,
      endsAt: duration === -1 ? -1 : Date.now() + (1000 * duration),
      effectInfo: Object.assign({}, extra, effectInfo || {}),
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

    // for now, we always overwrite when uniques
    if (effect.effectInfo.unique) {
      character.effects[type] = character.effects[type].filter(e => e.effectName !== effect.effectName);
    }

    character.effects[type].push(effect);
  }

  // remove a stale or removed effect
  public removeEffect(character: ICharacter, effect: IStatusEffect): void {
    const effectData = this.getEffectData(effect.effectName);
    const { type } = effectData.effect;

    character.effects[type] = character.effects[type].filter(e => e.uuid !== effect.uuid);
  }

  public removeEffectManually(character: ICharacter, effectNameOrUUID: string): void {

    let effect!: IStatusEffect;

    Object.values(character.effects).forEach(effectContainer => {
      effectContainer.forEach(checkEffect => {
        if (effect) return;
        if (checkEffect.effectName !== effectNameOrUUID && checkEffect.uuid !== effectNameOrUUID) return;

        effect = checkEffect;
      });
    });

    if (!effect) return;

    const meta = this.getEffectData(effect.effectName);
    if (!meta.effect.canRemove) return;

    this.removeEffect(character, effect);
  }

  // remove all effects
  public resetEffects(character: ICharacter): void {
    Object.values(character.effects).forEach(effectContainer => {
      effectContainer.forEach(effect => {
        this.removeEffect(character, effect);
      });
    });
  }

}
