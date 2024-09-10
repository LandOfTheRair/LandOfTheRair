import {
  Allegiance,
  IMacroCommandArgs,
  IPlayer,
  MessageType,
  Skill,
} from '../../../../interfaces';
import { MacroCommand } from '../../../../models/macro';

export class ShowSkills extends MacroCommand {
  override aliases = ['show skills'];
  override canBeInstant = false;
  override canBeFast = true;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    let message = `You are ${player.name}, the ${player.alignment} level ${player.level} ${player.baseClass}.`;
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
      const skillLevel = this.game.characterHelper.getSkillLevel(
        player,
        key as Skill,
      );
      const skillName = this.game.contentManager.getSkillDescription(
        key as Skill,
        skillLevel,
      );
      message = `Your ${key.toUpperCase()} skill level is ${skillLevel} (${skillName}).`;
      this.game.messageHelper.sendLogMessageToPlayer(
        player,
        { message, sfx: undefined },
        [MessageType.Description],
      );
    });
  }
}
