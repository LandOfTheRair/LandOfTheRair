import { ICharacter, IMacroCommandArgs, IPlayer } from '../../../../interfaces';
import { SkillCommand } from '../../../../models/macro';

export class Hide extends SkillCommand {

  aliases = ['hide'];
  canBeInstant = false;
  canBeFast = false;

  canUse(char: ICharacter) {
    return this.game.visibilityHelper.canHide(char);
  }

  execute(char: ICharacter) {
    this.use(char);
  }

  use(char: ICharacter) {
    if (!this.game.visibilityHelper.canHide(char)) {
      this.sendMessage(char, this.game.visibilityHelper.reasonUnableToHide(char));
      return;
    }

    this.game.effectHelper.addEffect(char, '', 'Hidden', { effect: { duration: -1 } });
  }
}
