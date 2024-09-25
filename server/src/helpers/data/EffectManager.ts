import { Injectable } from 'injection-js';

import { isString } from 'lodash';

import { ICharacter, IStatusEffect, IStatusEffectData } from '../../interfaces';

import { Effect } from '../../models';
import { BaseService } from '../../models/BaseService';
import * as allEffectRefs from '../game/effects';

@Injectable()
export class EffectManager extends BaseService {
  private effects: Record<string, Effect> = {};

  // initialize all of the effect metas we have available
  public async init() {
    Object.keys(allEffectRefs).forEach((eff) => {
      this.effects[eff] = new allEffectRefs[eff](this.game);
    });
  }

  // get the metadata for an effect
  public getEffectData(effectName: string, context: string): IStatusEffectData {
    return this.game.contentManager.getEffect(effectName, context);
  }

  // get a ref to an effect
  public getEffectRef(effectName: string): Effect {
    return this.effects[effectName];
  }

  // get a ref to an effect
  public getEffectName(target: ICharacter, effect: IStatusEffect): string {
    const effectRef = this.getEffectRef(effect.effectRef ?? effect.effectName);
    return effectRef.formatEffectName(target, effect);
  }

  // called when an effect is created
  public effectCreate(
    effectName: string,
    character: ICharacter,
    effect: IStatusEffect,
  ) {
    const effectRef = this.getEffectRef(effect.effectRef || effectName);

    if (isString(effect.effectInfo.unique)) {
      // effects like imbue that can be applied multiple separate times if some of them are equipped
      if (effect.effectInfo.canOverlapUniqueIfEquipped) {
        this.game.effectHelper.removeSimilarEffects(
          character,
          effect.effectInfo.unique as string,
          effectName,
          false,
          !effect.effectInfo.canOverlapUniqueIfEquipped,
        );

        // other effects, like stances
      } else {
        this.game.effectHelper.removeSimilarEffects(
          character,
          effect.effectInfo.unique as string,
          effectName,
          true,
        );
      }
    }

    if (effectRef) {
      effectRef.create(character, effect);
    }

    const effectData = this.getEffectData(
      effect.effectRef || effectName,
      `EC:${character.name}`,
    );

    // send the cast message to the caster
    const createMessage = this.formatMessage(
      effectData.effectMeta.castMessage || '',
      { target: character.name },
    );
    if (
      character.uuid !== effect.sourceUUID &&
      effect.sourceUUID &&
      createMessage &&
      !effect.effectInfo.disableMessages
    ) {
      this.game.messageHelper.sendLogMessageToPlayer(effect.sourceUUID, {
        message: createMessage,
        sfx: effectData.effectMeta.castSfx,
      });
    }
  }

  // called when an effect is applied
  public effectApply(
    effectName: string,
    character: ICharacter,
    effect: IStatusEffect,
  ) {
    const effectRef = this.getEffectRef(effect.effectRef || effectName);
    if (effectRef) {
      effectRef.apply(character, effect);
    }

    const effectData = this.getEffectData(
      effect.effectRef || effectName,
      `EA:${character.name}`,
    );

    // send the apply message to the target
    const applyMessage = this.formatMessage(
      effectData.effectMeta.applyMessage || '',
      { target: character.name },
    );
    if (applyMessage && !effect.effectInfo.disableMessages) {
      this.game.messageHelper.sendLogMessageToPlayer(character, {
        message: applyMessage,
        sfx: effectData.effectMeta.applySfx,
      });
    }
  }

  // called when an effect is ticked
  public effectTick(
    effectName: string,
    character: ICharacter,
    effect: IStatusEffect,
  ) {
    const effectRef = this.getEffectRef(effect.effectRef || effectName);
    if (effectRef) {
      effectRef.tick(character, effect);
    }
  }

  // called when an effect is unapply
  public effectUnapply(
    effectName: string,
    character: ICharacter,
    effect: IStatusEffect,
  ) {
    const effectRef = this.getEffectRef(effect.effectRef || effectName);
    if (effectRef) {
      effectRef.unapply(character, effect);
    }

    const effectData = this.getEffectData(
      effect.effectRef || effectName,
      `EU:${character.name}`,
    );

    // send the unapply message to the target
    const unapplyMessage = this.formatMessage(
      effectData.effectMeta.unapplyMessage || '',
      { target: character.name },
    );
    if (unapplyMessage && !effect.effectInfo.disableMessages) {
      this.game.messageHelper.sendLogMessageToPlayer(character, {
        message: unapplyMessage,
      });
    }
  }

  // called when an effect is expired (duration = 0)
  public effectExpire(
    effectName: string,
    character: ICharacter,
    effect: IStatusEffect,
  ) {
    const effectRef = this.getEffectRef(effect.effectRef || effectName);
    if (effectRef) {
      effectRef.expire(character, effect);
    }
  }

  private formatMessage(message: string, refs: Record<string, string>): string {
    Object.keys(refs).forEach((ref) => {
      message = message.split(`%${ref}`).join(refs[ref]);
    });

    return message;
  }
}
