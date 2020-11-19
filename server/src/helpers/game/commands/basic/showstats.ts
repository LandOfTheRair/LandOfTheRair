import { Allegiance, IMacroCommandArgs, IPlayer, MessageType, Stat } from '../../../../interfaces';
import { MacroCommand } from '../../../../models/macro';

export class ShowStats extends MacroCommand {

  aliases = ['show stats'];
  canBeInstant = false;
  canBeFast = true;

  execute(player: IPlayer, args: IMacroCommandArgs) {
    let message = `You are ${player.name}, the ${player.alignment} level ${player.level} ${player.baseClass}.`;
    this.game.messageHelper.sendLogMessageToPlayer(player, { message, sfx: undefined }, [MessageType.Description]);
    message = `Your allegiance lies with ${player.allegiance === Allegiance.None ? 'no one' : `the ${player.allegiance}`}.`;
    this.game.messageHelper.sendLogMessageToPlayer(player, { message, sfx: undefined }, [MessageType.Description]);

    // TODO: show stats all (only show non-zero stats)

    Object.keys(player.stats).forEach(key => {
      message = `Your ${key.toUpperCase()} is ${this.game.characterHelper.getStat(player, key as Stat)}.`;
      this.game.messageHelper.sendLogMessageToPlayer(player, { message, sfx: undefined }, [MessageType.Description]);
    });
  }
}
