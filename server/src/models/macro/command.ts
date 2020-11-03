import { Game } from '../../helpers';
import { ICharacter, IMacroCommand, IMacroCommandArgs, IPlayer } from '../../interfaces';

export abstract class MacroCommand implements IMacroCommand {

  abstract aliases: string[];   // the aliases representing this command
  canBeInstant = false;         // whether the command can happen immediately (ie, UI-related functions)
  canBeFast = false;            // whether the command can happen on the 'fast' cycle (used for 'faster' commands outside the round timer)

  constructor(protected game: Game) {}

  protected sendMessage(character: ICharacter, message: string, sfx?: string): void {
    this.game.messageHelper.sendLogMessageToPlayer(character, { message, sfx });
  }

  execute(executor: IPlayer, args: IMacroCommandArgs): void {}
}
