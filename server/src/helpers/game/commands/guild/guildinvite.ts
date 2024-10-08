import { IMacroCommandArgs, IPlayer } from '../../../../interfaces';
import { MacroCommand, Player } from '../../../../models';

export class GuildInvite extends MacroCommand {
  override aliases = ['guild invite'];
  override canBeInstant = false;
  override canBeFast = false;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    const target = this.game.targettingHelper.getFirstPossibleTargetInViewRange(
      player,
      args.stringArgs,
    );
    if (!target) return this.youDontSeeThatPerson(player, args.stringArgs);

    if (!this.game.characterHelper.isPlayer(target)) {
      this.sendMessage(player, 'That is not a player!');
      return;
    }

    this.game.guildManager.inviteMember(player as Player, target as Player);
  }
}
