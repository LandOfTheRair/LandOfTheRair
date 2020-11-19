import { Injectable } from 'injection-js';
import { BaseService, ICharacter, IStatusEffect, IStatusEffectData } from '../../interfaces';

import * as allEffects from '../../../content/_output/effect-data.json';
import { Effect } from '../../models';
import * as allEffectRefs from '../game/effects';

@Injectable()
export class EffectManager extends BaseService {

  private effects: Record<string, Effect> = {};

  // initialize all of the effect metas we have available
  public async init() {
    Object.keys(allEffectRefs).forEach(eff => {
      this.effects[eff] = new allEffectRefs[eff](this.game);
    });
  }

  public getEffectData(effectName: string): IStatusEffectData {
    const effectData = allEffects[effectName];
    if (!effectData) throw new Error(`No effect ${effectName} exists.`);

    return effectData;
  }

  public getEffectRef(effectName: string): Effect {
    return this.effects[effectName];
  }

  public effectCreate(effectName: string, character: ICharacter, effect: IStatusEffect) {
    const effectRef = this.getEffectRef(effectName);
    if (effectRef) {
      effectRef.create(character, effect);
    }

    const effectData = this.getEffectData(effectName);

    // send the cast message to the caster
    const createMessage = this.formatMessage(effectData.meta.castMessage || '', { target: character.name });
    if (character.uuid !== effect.sourceUUID && effect.sourceUUID && createMessage) {
      this.game.messageHelper.sendLogMessageToPlayer(effect.sourceUUID, { message: createMessage, sfx: effectData.meta.castSfx });
    }
  }

  public effectApply(effectName: string, character: ICharacter, effect: IStatusEffect) {
    const effectRef = this.getEffectRef(effectName);
    if (effectRef) {
      effectRef.apply(character, effect);
    }

    const effectData = this.getEffectData(effectName);

    // send the apply message to the target
    const applyMessage = this.formatMessage(effectData.meta.applyMessage || '', { target: character.name });
    if (applyMessage) {
      this.game.messageHelper.sendLogMessageToPlayer(character, { message: applyMessage, sfx: effectData.meta.applySfx });
    }
  }

  public effectTick(effectName: string, character: ICharacter, effect: IStatusEffect) {

    const effectRef = this.getEffectRef(effectName);
    if (effectRef) {
      effectRef.tick(character, effect);
    }
  }

  public effectUnapply(effectName: string, character: ICharacter, effect: IStatusEffect) {
    const effectRef = this.getEffectRef(effectName);
    if (effectRef) {
      effectRef.unapply(character, effect);
    }

    const effectData = this.getEffectData(effectName);

    // send the unapply message to the target
    const unapplyMessage = this.formatMessage(effectData.meta.unapplyMessage || '', { target: character.name });
    if (unapplyMessage) {
      this.game.messageHelper.sendLogMessageToPlayer(character, { message: unapplyMessage });
    }
  }

  public effectDestroy(effectName: string, character: ICharacter, effect: IStatusEffect) {
    const effectRef = this.getEffectRef(effectName);
    if (effectRef) {
      effectRef.destroy(character, effect);
    }
  }

  private formatMessage(message: string, refs: Record<string, string>): string {
    Object.keys(refs).forEach(ref => {
      message = message.split(`%${ref}`).join(refs[ref]);
    });

    return message;
  }

}
