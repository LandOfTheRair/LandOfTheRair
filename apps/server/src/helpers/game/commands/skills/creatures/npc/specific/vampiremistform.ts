import { isPlayer } from '@lotr/characters';
import { SpellCommand } from '@lotr/core';
import type { ICharacter } from '@lotr/interfaces';

export class VampireMistForm extends SpellCommand {
  override aliases = ['vampiremistform'];
  override requiresLearn = true;

  override mpCost(char: ICharacter) {
    return char.mp.maximum * 0.75;
  }

  override canUse(char: ICharacter, target: ICharacter) {
    return (
      char.mp.current > this.mpCost(char) &&
      char.hp.current < char.hp.maximum * 0.5
    );
  }

  override use(executor: ICharacter, target: ICharacter) {
    if (isPlayer(executor)) return;

    this.game.messageHelper.sendLogMessageToRadius(executor, 8, {
      message: 'Gwahaha! Very good! I must retreat momentarily.',
    });
    this.game.effectHelper.addEffect(executor, executor, 'VampireMistForm', {
      effect: { duration: 10 },
    });
  }
}
