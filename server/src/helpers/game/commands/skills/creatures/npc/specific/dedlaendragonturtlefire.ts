import { ICharacter } from '../../../../../../../interfaces';
import { SpellCommand } from '../../../../../../../models/macro';

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
    if (this.game.characterHelper.isPlayer(executor)) return;

    this.game.commandHandler
      .getSkillRef('FireMist')
      .use(
        executor,
        null,
        { overrideEffect: { range: 3, name: 'FireMist' } },
        target,
      );
  }
}
