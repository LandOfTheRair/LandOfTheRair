import type { ICharacter, IStatusEffect } from '@lotr/interfaces';
import { Effect } from '../../../../../models';

export class Lightbath extends Effect {
  public override tick(char: ICharacter, effect: IStatusEffect) {
    super.tick(char, effect);

    this.game.commandHandler.getSkillRef('Light').use(null, char);
  }
}
