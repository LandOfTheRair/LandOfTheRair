import { IMacroCommandArgs, IPlayer } from '../../../../interfaces';
import { MacroCommand } from '../../../../models/macro';

export class GMUpdateContent extends MacroCommand {

  override aliases = ['@updatecontent', '@update'];
  override isGMCommand = true;
  override canBeInstant = false;
  override canBeFast = false;

  override async execute(player: IPlayer, args: IMacroCommandArgs) {

    this.sendMessage(player, 'Initiating a content update.');

    await this.game.contentManager.reload();

    this.sendMessage(player, 'Content updated!');
  }
}
