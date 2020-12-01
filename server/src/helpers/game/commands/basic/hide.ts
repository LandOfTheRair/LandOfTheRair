import { ICharacter, IMacroCommandArgs, IPlayer } from '../../../../interfaces';
import { SkillCommand } from '../../../../models/macro';

export class Hide extends SkillCommand {

  aliases = ['hide'];
  canBeInstant = false;
  canBeFast = false;

  canUse(char: ICharacter) {
    return this.game.visibilityHelper.canHide(char);
  }

  execute(player: IPlayer, args: IMacroCommandArgs) {
    if (!this.game.visibilityHelper.canHide(player)) {
      this.sendMessage(player, this.game.visibilityHelper.reasonUnableToHide(player));
      return;
    }

    this.game.effectHelper.addEffect(player, '', 'Hidden', { effect: { duration: -1 } });
  }
}
