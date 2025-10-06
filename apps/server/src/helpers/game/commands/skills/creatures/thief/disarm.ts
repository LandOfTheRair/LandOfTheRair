import type {
  ICharacter,
  IMacroCommandArgs,
  IPlayer } from '@lotr/interfaces';
import {
  Skill,
} from '@lotr/interfaces';
import { SkillCommand } from '../../../../../../models/macro';

export class Disarm extends SkillCommand {
  override aliases = ['disarm'];
  override requiresLearn = true;

  override range(char: ICharacter) {
    return 1;
  }

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    const target = this.getTarget(player, args.stringArgs, true, true);
    if (!target) return;

    const trap = this.game.trapHelper.getTrapAt(player.map, target.x, target.y);
    if (!trap) {
      this.sendMessage(player, 'There is not a trap there!');
      return;
    }

    const trapItem = trap.item;
    const trapEffect = this.game.itemHelper.getItemProperty(
      trapItem,
      'trapEffect',
    );
    if (trapItem.mods.trapSetBy === player.uuid) {
return this.sendMessage(player, 'You cannot disarm your own traps!');
}

    if (!this.game.trapHelper.canDisarmTrap(player, trapItem)) {
      // if you fail to disarm, you have a chance of springing it
      if (this.game.diceRollerHelper.XInOneHundred(10)) {
        this.game.trapHelper.triggerTrap(player, trap);
      }

      return this.sendMessage(player, 'You fail to disarm the trap!');
    }

    this.game.trapHelper.removeTrap(player.map, player.x, player.y, trap);
    this.game.playerHelper.gainSkill(player, Skill.Thievery, 5);
    this.sendMessage(
      player,
      `You disarmed the ${trapEffect?.name ?? 'unknown'} trap.`,
    );
  }
}
