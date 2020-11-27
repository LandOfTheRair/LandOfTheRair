import { BaseEffect, ICharacter, IStatusEffect, MessageInfo, MessageType } from '../../interfaces';

import { Game } from '../../helpers';

export class Effect implements BaseEffect {

  constructor(protected game: Game) {}

  public sendMessage(character: ICharacter|string, message: MessageInfo) {
    this.game.messageHelper.sendLogMessageToPlayer(character, message, [MessageType.Miscellaneous]);
  }

  public create(char: ICharacter, effect: IStatusEffect) {}

  public apply(char: ICharacter, effect: IStatusEffect) {}

  public tick(char: ICharacter, effect: IStatusEffect) {
    effect.effectInfo.currentTick = effect.effectInfo.currentTick || 0;
    effect.effectInfo.currentTick++;
  }

  public unapply(char: ICharacter, effect: IStatusEffect) {}

  public destroy(char: ICharacter, effect: IStatusEffect) {}

}
