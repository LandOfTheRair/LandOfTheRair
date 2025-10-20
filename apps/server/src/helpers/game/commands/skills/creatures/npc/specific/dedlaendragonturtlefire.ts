import { isPlayer } from '@lotr/characters';
import { SpellCommand } from '@lotr/core';
import type { ICharacter } from '@lotr/interfaces';

export class DedlaenDragonTurtleFire extends SpellCommand {
  override aliases = ['dedlaendragonturtlefire'];
  override requiresLearn = true;

  override canUse(char: ICharacter, target: ICharacter) {
    return !!target;
  }

  override mpCost(): number {
    return 0;
  }

  override use(executor: ICharacter, target: ICharacter) {
    if (isPlayer(executor)) return;

    this.game.commandHandler
      .getSkillRef('FireMist')
      .use(
        executor,
        undefined,
        { overrideEffect: { range: 3, name: 'FireMist' } },
        target,
      );
  }
}
