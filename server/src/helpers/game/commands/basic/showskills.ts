import { Allegiance, IMacroCommandArgs, IPlayer, MessageType, Skill } from '../../../../interfaces';
import { MacroCommand } from '../../../../models/macro';

export class ShowSkills extends MacroCommand {

  aliases = ['show skills'];
  canBeInstant = false;
  canBeFast = true;

  execute(player: IPlayer, args: IMacroCommandArgs) {
    let message = `You are ${player.name}, the ${player.alignment} level ${player.level} ${player.baseClass}.`;
    this.game.messageHelper.sendLogMessageToPlayer(player, { message, sfx: undefined }, [MessageType.Description]);
    message = `Your allegiance lies with ${player.allegiance === Allegiance.None ? 'no one' : `the ${player.allegiance}`}.`;
    this.game.messageHelper.sendLogMessageToPlayer(player, { message, sfx: undefined }, [MessageType.Description]);

    Object.keys(player.stats).forEach(key => {
      message = `Your ${key.toUpperCase()} skill level is ${this.game.characterHelper.getSkillLevel(player, key as Skill)}`;
      this.game.messageHelper.sendLogMessageToPlayer(player, { message, sfx: undefined }, [MessageType.Description]);
    });
  }
}
