import { Allegiance, IMacroCommandArgs, IPlayer, MessageType, Stat } from '../../../../interfaces';
import { MacroCommand } from '../../../../models/macro';

export class ShowStats extends MacroCommand {

  override aliases = ['show stats'];
  override canBeInstant = false;
  override canBeFast = true;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    let message = `You are ${player.name}, the ${player.alignment} level ${player.level} ${player.baseClass}.<br>`;
    message = `${message}Your allegiance lies with ${player.allegiance === Allegiance.None ? 'no one' : `the ${player.allegiance}`}.`;

    const showAll = !!args.stringArgs;
    const hash = showAll ? player.totalStats : player.stats;

    Object.keys(hash).forEach(key => {
      const value = this.game.characterHelper.getStat(player, key as Stat);
      if (value === 0) return;

      message = `${message}<br>Your ${key.toUpperCase()} is ${this.game.characterHelper.getStat(player, key as Stat)}.`;
    });

    this.game.messageHelper.sendLogMessageToPlayer(player, { message, sfx: undefined }, [MessageType.Description]);
  }
}
