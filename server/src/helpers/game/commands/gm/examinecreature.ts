import { IMacroCommandArgs, IPlayer } from '../../../../interfaces';
import { MacroCommand } from '../../../../models/macro';

export class GMExamineCreature extends MacroCommand {

  override aliases = ['@examinecreature', '@excreature', '@exc'];
  override isGMCommand = true;
  override canBeInstant = false;
  override canBeFast = false;

  override execute(player: IPlayer, args: IMacroCommandArgs) {

    const target = this.game.targettingHelper.getFirstPossibleTargetInViewRange(player, args.stringArgs);
    if (!target) return this.youDontSeeThatPerson(player, args.stringArgs);

    this.sendMessage(player, `Examine ${target.name}:`);
    this.sendMessage(player, '===');
    this.sendMessage(player, `\`${JSON.stringify(target, null, 2)}\``);
    this.sendMessage(player, '===');
  }
}
