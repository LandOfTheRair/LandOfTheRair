import { ICharacter, IStatusEffect, MessageInfo, MessageType } from '../../interfaces';

import { Game } from '../../helpers';
import { BaseEffect } from '../../interfaces/BaseEffect';

export class Effect implements BaseEffect {

  constructor(protected game: Game) {}

  public sendMessage(character: ICharacter|string, message: MessageInfo) {

    // if it's not a character, the character is the uuid
    let uuid = (character as ICharacter).uuid;
    if (!uuid) uuid = character as string;

    const ref = this.game.worldManager.getCharacter(uuid);
    if (!ref) return;

    this.game.messageHelper.sendLogMessageToPlayer(ref, message, [MessageType.Miscellaneous]);
  }

  public create(char: ICharacter, effect: IStatusEffect) {}

  public apply(char: ICharacter, effect: IStatusEffect) {
    this.game.characterHelper.calculateStatTotals(char);
  }

  public tick(char: ICharacter, effect: IStatusEffect) {
    effect.effectInfo.currentTick = effect.effectInfo.currentTick || 0;
    effect.effectInfo.currentTick++;
  }

  public unapply(char: ICharacter, effect: IStatusEffect) {
    this.game.characterHelper.calculateStatTotals(char);
  }

  public destroy(char: ICharacter, effect: IStatusEffect) {}

}
