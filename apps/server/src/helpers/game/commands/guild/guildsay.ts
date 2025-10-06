import type { IMacroCommandArgs, IPlayer } from '@lotr/interfaces';
import type { Player } from '../../../../models';
import { MacroCommand } from '../../../../models';

export class GuildSay extends MacroCommand {
  override aliases = ['guildsay'];
  override canBeInstant = true;
  override canBeFast = true;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    const guild = this.game.guildManager.getGuildById(
      (player as Player).guildId,
    );
    if (!guild) {
      this.sendMessage(player, 'You do not have a guild!');
      return;
    }

    this.game.guildManager.guildMessage(
      guild,
      `[Guild] **${player.name}**: ${args.stringArgs}`,
    );
  }
}
