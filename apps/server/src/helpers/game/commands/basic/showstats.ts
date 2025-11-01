import { getStat } from '@lotr/characters';
import { MacroCommand } from '@lotr/core';
import type { IMacroCommandArgs, IPlayer, Stat } from '@lotr/interfaces';
import { Allegiance, MessageType } from '@lotr/interfaces';

export class ShowStats extends MacroCommand {
  override aliases = ['show stats'];
  override canBeInstant = false;
  override canBeFast = true;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    let message = `You are ${player.name}, the level ${player.level} ${player.baseClass}.<br>`;
    message = `${message}Your allegiance lies with ${player.allegiance === Allegiance.None ? 'no one' : `the ${player.allegiance}`}.`;

    if (args.stringArgs === 'leader') {
      message = `${message}<br>Your leaderboard statistics are as follows:<br>`;

      Object.keys(player.statistics.statistics).forEach((key) => {
        message = `${message}<br>${key.toUpperCase()} ${player.statistics.statistics[key].toLocaleString()}`;
      });

      this.game.messageHelper.sendLogMessageToPlayer(
        player,
        { message, sfx: undefined },
        [MessageType.Description],
      );
      return;
    }

    message = `${message}<br>Your  statistics are as follows:<br>`;
    const showAll = !!args.stringArgs;
    const hash = showAll ? player.totalStats : player.stats;

    Object.keys(hash)
      .sort()
      .forEach((key) => {
        const value = getStat(player, key as Stat);
        if (value === 0) return;

        const statVal = getStat(player, key as Stat);
        const showBase =
          player.stats[key as Stat] && player.stats[key as Stat] !== statVal;
        message = `${message}<br>Your ${key.toUpperCase()} is ${statVal}${showBase ? ' (base: ' + player.stats[key] + ')' : ''}.`;
      });

    this.game.messageHelper.sendLogMessageToPlayer(
      player,
      { message, sfx: undefined },
      [MessageType.Description],
    );
  }
}
