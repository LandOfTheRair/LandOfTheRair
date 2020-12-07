import { Injectable } from 'injection-js';
import { ICharacter, IStatusEffect, IStatusEffectData } from '../../interfaces';

import * as allEffects from '../../../content/_output/effect-data.json';
import { Effect } from '../../models';
import { BaseService } from '../../models/BaseService';
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

  // get the metadata for an effect
  public getEffectData(effectName: string): IStatusEffectData {
    return allEffects[effectName];
  }

  // get a ref to an effect
  public getEffectRef(effectName: string): Effect {
    return this.effects[effectName];
  }

  // called when an effect is created
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

  // called when an effect is applied
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

  // called when an effect is ticked
  public effectTick(effectName: string, character: ICharacter, effect: IStatusEffect) {

    const effectRef = this.getEffectRef(effectName);
    if (effectRef) {
      effectRef.tick(character, effect);
    }
  }

  // called when an effect is unapply
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

  // called when an effect is destroy
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
