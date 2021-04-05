import { ICharacter } from '../../../../interfaces';
import { SkillCommand } from '../../../../models/macro';

export class Reveal extends SkillCommand {

  override aliases = ['reveal'];
  override canBeInstant = false;
  override canBeFast = false;

  override execute(char: ICharacter) {
    this.use(char);
  }

  override use(char: ICharacter) {
    if (!this.game.effectHelper.hasEffect(char, 'Hidden')) {
      this.sendMessage(char, 'You are not hidden!');
      return;
    }

    this.game.effectHelper.removeEffectByName(char, 'Hidden');
  }
}
