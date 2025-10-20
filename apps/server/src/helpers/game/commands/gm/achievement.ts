import { isPlayer } from '@lotr/characters';
import { achievementExists, achievementHas } from '@lotr/content';
import { MacroCommand } from '@lotr/core';
import type { IMacroCommandArgs, IPlayer } from '@lotr/interfaces';
import type { Player } from '../../../../models';

export class GMToggleAchievement extends MacroCommand {
  override aliases = ['@achievement', '@ach'];
  override isGMCommand = true;
  override canBeInstant = false;
  override canBeFast = false;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    const [targetName] = args.arrayArgs;
    const achievement = args.arrayArgs.slice(1).join(' ').trim();
    if (!targetName || !achievement) {
      this.sendMessage(player, 'Syntax: Player Achievement');
      return;
    }

    const target = this.game.targettingHelper.getFirstPossibleTargetInViewRange(
      player,
      targetName,
    ) as Player;
    if (!target) return this.youDontSeeThatPerson(player, targetName);

    if (!isPlayer(player)) {
      return this.sendMessage(player, 'That is not a player.');
    }

    if (!achievementExists(achievement)) {
      return this.sendMessage(player, 'That achievement does not exist.');
    }

    if (achievementHas(target, achievement)) {
      this.game.achievementsHelper.achievementUnearn(target, achievement);
      this.sendMessage(player, 'Took that achievement away.');
    } else {
      this.game.achievementsHelper.achievementEarn(target, achievement);
      this.sendMessage(player, 'Gave that achievement.');
    }
  }
}
