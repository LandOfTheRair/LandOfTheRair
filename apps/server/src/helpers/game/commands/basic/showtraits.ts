import { MacroCommand } from '@lotr/core';
import type { IMacroCommandArgs, IPlayer } from '@lotr/interfaces';
import { Allegiance, MessageType } from '@lotr/interfaces';

export class ShowTraits extends MacroCommand {
  override aliases = ['show traits'];
  override canBeInstant = false;
  override canBeFast = true;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    let message = `You are ${player.name}, the level ${player.level} ${player.baseClass}.<br>`;
    message = `${message}Your allegiance lies with ${player.allegiance === Allegiance.None ? 'no one' : `the ${player.allegiance}`}.`;
    message = `${message}<br>Your traits are as follows:<br>`;

    Object.keys(player.allTraits)
      .sort()
      .forEach((key) => {
        const value = player.allTraits[key];
        if (value === 0) return;

        message = `${message}<br>${key.toUpperCase()}: ${value}.`;
      });

    this.game.messageHelper.sendLogMessageToPlayer(
      player,
      { message, sfx: undefined },
      [MessageType.Description],
    );
  }
}
