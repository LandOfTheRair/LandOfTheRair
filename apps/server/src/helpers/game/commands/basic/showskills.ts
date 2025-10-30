import { getSkillLevel } from '@lotr/characters';
import { skillGetDescription } from '@lotr/content';
import { MacroCommand } from '@lotr/core';
import type { IMacroCommandArgs, IPlayer, Skill } from '@lotr/interfaces';
import { Allegiance, MessageType } from '@lotr/interfaces';

export class ShowSkills extends MacroCommand {
  override aliases = ['show skills'];
  override canBeInstant = false;
  override canBeFast = true;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    let message = `You are ${player.name}, the level ${player.level} ${player.baseClass}.`;
    this.game.messageHelper.sendLogMessageToPlayer(
      player,
      { message, sfx: undefined },
      [MessageType.Description],
    );
    message = `Your allegiance lies with ${player.allegiance === Allegiance.None ? 'no one' : `the ${player.allegiance}`}.`;
    this.game.messageHelper.sendLogMessageToPlayer(
      player,
      { message, sfx: undefined },
      [MessageType.Description],
    );

    Object.keys(player.skills).forEach((key) => {
      const skillLevel = getSkillLevel(player, key as Skill);
      const skillName = skillGetDescription(key as Skill, skillLevel);
      message = `Your ${key.toUpperCase()} skill level is ${skillLevel} (${skillName}).`;
      this.game.messageHelper.sendLogMessageToPlayer(
        player,
        { message, sfx: undefined },
        [MessageType.Description],
      );
    });
  }
}
