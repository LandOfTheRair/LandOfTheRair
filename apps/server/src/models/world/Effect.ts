import type {
  DamageArgs,
  ICharacter,
  IStatusEffect,
  MessageInfo,
} from '@lotr/interfaces';
import { MessageType } from '@lotr/interfaces';

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import type { IServerGame } from '@lotr/interfaces';
import type { BaseEffect } from '../BaseEffect';

export class Effect implements BaseEffect {
  constructor(protected game: IServerGame) {}

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
    attacker: ICharacter | undefined,
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

  public downcast(
    effect: IStatusEffect,
    char: ICharacter,
    target: ICharacter,
  ) {}

  protected getLinkedTarget(
    char: ICharacter,
    effect: IStatusEffect,
  ): ICharacter | undefined {
    if (!effect.effectInfo?.linkedTo) return undefined;

    const linkedTarget = this.game.worldManager
      .getMapStateForCharacter(char)
      ?.getCharacterByUUID(effect.effectInfo?.linkedTo);

    return linkedTarget;
  }
}
