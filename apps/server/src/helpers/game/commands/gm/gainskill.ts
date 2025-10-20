import { MacroCommand } from '@lotr/core';
import type { IMacroCommandArgs, IPlayer } from '@lotr/interfaces';
import { Skill } from '@lotr/interfaces';

export class GMGainSkill extends MacroCommand {
  override aliases = ['@gainskill', '@skill', '@s'];
  override isGMCommand = true;
  override canBeInstant = false;
  override canBeFast = false;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    if (!args.stringArgs) {
      this.sendMessage(player, 'Syntax: SkillName Amount');
      return;
    }

    const skill = Skill[args.stringArgs.split(' ')[0]];
    const value = Math.round(+args.stringArgs.split(' ')[1]);

    if (!skill) {
      return this.sendMessage(player, 'That is not a valid skill name.');
    }

    try {
      this.game.playerHelper.gainSkill(player, skill, value);
      this.sendMessage(player, `You gained ${value} skill in ${skill}.`);
    } catch (e) {
      this.sendMessage(player, `@skill function failed. ${e}`);
    }
  }
}
