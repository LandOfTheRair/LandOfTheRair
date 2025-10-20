import { isPlayer } from '@lotr/characters';
import { MacroCommand, wsSendToSocket } from '@lotr/core';
import type { ICharacter, IMacroCommandArgs, IPlayer } from '@lotr/interfaces';
import { GameAction } from '@lotr/interfaces';

export class GMTakeover extends MacroCommand {
  override aliases = ['@takeover'];
  override isGMCommand = true;
  override canBeInstant = false;
  override canBeFast = false;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    let target: ICharacter | undefined;

    if (args.stringArgs) {
      target = this.game.targettingHelper.getFirstPossibleTargetInViewRange(
        player,
        args.stringArgs,
      );

      if (!target) return this.youDontSeeThatPerson(player, args.stringArgs);
    }

    if (target && isPlayer(target)) {
      this.sendMessage(player, `You can't do that.`);
      return;
    }

    if (player.takingOver) {
      delete player.takingOver?.takenOverBy;
      player.takingOver = undefined;

      wsSendToSocket(player.username, {
        action: GameAction.GamePatchPlayer,
        player,
      });

      this.sendMessage(player, `You are now no longer taking anyone over.`);
      return;
    }

    if (!target) {
      this.sendMessage(player, 'No one to take over.');
      return;
    }

    player.takingOver = target;
    target.takenOverBy = player;

    this.sendMessage(player, `You are now taking over ${target.name}.`);
  }
}
