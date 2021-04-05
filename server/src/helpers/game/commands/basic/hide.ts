import { ICharacter } from '../../../../interfaces';
import { SkillCommand } from '../../../../models/macro';

export class Hide extends SkillCommand {

  override aliases = ['hide'];
  override canBeInstant = false;
  override canBeFast = false;

  override canUse(char: ICharacter) {
    return this.game.visibilityHelper.canHide(char);
  }

  override execute(char: ICharacter) {
    this.use(char);
  }

  override use(char: ICharacter) {
    if (!this.game.visibilityHelper.canHide(char)) {
      this.sendMessage(char, this.game.visibilityHelper.reasonUnableToHide(char));
      return;
    }

    this.game.effectHelper.addEffect(char, '', 'Hidden', { effect: { duration: -1 } });
  }
}
