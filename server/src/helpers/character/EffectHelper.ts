import { Injectable } from 'injection-js';
import { isString } from 'lodash';
import uuid from 'uuid/v4';

import { BaseService, ICharacter, IStatusEffect, IStatusEffectInfo } from '../../interfaces';

import * as allEffects from '../../../content/_output/effect-data.json';

@Injectable()
export class EffectHelper extends BaseService {

  public init() {}

  // check to see if any effects have expired
  public tickEffects(character: ICharacter): void {
    const now = Date.now();

    Object.values(character.effects).forEach(effectContainer => {
      effectContainer.forEach(effect => {
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

}
