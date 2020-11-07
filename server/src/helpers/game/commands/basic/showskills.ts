import { IMacroCommandArgs, IPlayer, Skill } from '../../../../interfaces';
import { MacroCommand } from '../../../../models/macro';

export class ShowSkills extends MacroCommand {

  aliases = ['show skills'];
  canBeInstant = false;
  canBeFast = true;

  execute(player: IPlayer, args: IMacroCommandArgs) {
    this.sendMessage(player, `You are ${player.name}, the ${player.alignment} level ${player.level} ${player.baseClass}.`);
    this.sendMessage(player, `Your allegiance lies with ${player.allegiance === 'None' ? 'no one' : `the ${player.allegiance}`}.`);

    Object.keys(player.skills).forEach(key => {
      this.sendMessage(player, `Your ${key.toUpperCase()} skill level is ${this.game.characterHelper.getSkillLevel(player, key as Skill)}`);
    });
  }
}
