import { Game } from '../../helpers';
import { ICharacter, IMacroCommand, IMacroCommandArgs, IPlayer } from '../../interfaces';

export abstract class MacroCommand implements IMacroCommand {

  abstract aliases: string[];
  canBeInstant = false;
  canBeFast = false;

  constructor(protected game: Game) {}

  protected sendMessage(character: ICharacter, message: string): void {
    this.game.messageHelper.sendLogMessageToPlayer(character, message);
  }

  execute(executor: IPlayer, args: IMacroCommandArgs): void {}
}
