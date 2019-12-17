import { Game } from '../../helpers';
import { ICharacter, IGame, IMacroCommand, IMacroCommandArgs, IPlayer } from '../../interfaces';

export abstract class MacroCommand implements IMacroCommand {
  abstract name: string[];
  canBeFast = false;

  protected sendMessage(game: IGame, character: ICharacter, message: string): void {
    (game as unknown as Game).messageHelper.sendMessage(character, message);
  }

  execute(executor: IPlayer, args: IMacroCommandArgs): void {}
}
