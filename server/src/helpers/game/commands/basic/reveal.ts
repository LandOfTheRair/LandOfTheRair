import { ICharacter } from '../../../../interfaces';
import { SkillCommand } from '../../../../models/macro';

export class Reveal extends SkillCommand {

  aliases = ['reveal'];
  canBeInstant = false;
  canBeFast = false;

  execute(char: ICharacter) {
    this.use(char);
  }

  use(char: ICharacter) {
    if (!this.game.effectHelper.hasEffect(char, 'Hidden')) {
      this.sendMessage(char, 'You are not hidden!');
      return;
    }

    this.game.effectHelper.removeEffectByName(char, 'Hidden');
  }
}
