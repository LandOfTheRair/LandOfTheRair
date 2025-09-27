import {
  DamageArgs,
  ICharacter,
  IStatusEffect,
  MessageInfo,
  MessageType,
} from '../../interfaces';

import { Game } from '../../helpers';
import { BaseEffect } from '../BaseEffect';

export class Effect implements BaseEffect {
  constructor(protected game: Game) {}

  public sendMessage(character: ICharacter | string, message: MessageInfo) {
    this.game.messageHelper.sendLogMessageToPlayer(character, message, [
      MessageType.Miscellaneous,
    ]);
  }

  public formatEffectName(char: ICharacter, effect: IStatusEffect): string {
    return effect.effectName;
  }

  public create(char: ICharacter, effect: IStatusEffect) {}

  public apply(char: ICharacter, effect: IStatusEffect) {}

  public tick(char: ICharacter, effect: IStatusEffect) {
    effect.effectInfo.currentTick = effect.effectInfo.currentTick || 0;
    effect.effectInfo.currentTick++;
  }

  public unapply(char: ICharacter, effect: IStatusEffect) {}

  public expire(char: ICharacter, effect: IStatusEffect) {}

  public incoming(
    effect: IStatusEffect,
    char: ICharacter,
    attacker: ICharacter | null,
    args: DamageArgs,
    currentDamage: number,
  ): number {
    return currentDamage;
  }

  public outgoing(
    effect: IStatusEffect,
    char: ICharacter,
    target: ICharacter,
    args: DamageArgs,
  ): void {}

  public recast(effect: IStatusEffect, char: ICharacter, target: ICharacter) {}
}
