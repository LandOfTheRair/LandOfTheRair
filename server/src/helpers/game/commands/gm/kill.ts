import { DamageClass, IMacroCommandArgs, IPlayer } from '../../../../interfaces';
import { MacroCommand } from '../../../../models/macro';

export class GMKill extends MacroCommand {

  override aliases = ['@kill', '@k'];
  override isGMCommand = true;
  override canBeInstant = false;
  override canBeFast = false;

  override execute(player: IPlayer, args: IMacroCommandArgs) {

    if (!args.stringArgs) {
      this.sendMessage(player, 'Syntax: Target');
      return;
    }

    const target = this.game.targettingHelper.getFirstPossibleTargetInViewRange(player, args.stringArgs);
    if (!target) return this.youDontSeeThatPerson(player, args.stringArgs);

    this.game.combatHelper.dealDamage(player, target, {
      damage: target.hp.maximum,
      damageClass: DamageClass.GM
    });

    if (!this.game.characterHelper.isDead(target)) {
      this.sendMessage(player, `I'm not sure why ${target.name} is still alive. Have some relevant stats:`);
      this.sendMessage(player, `${target.name} has ${target.hp.current}/${target.hp.maximum} HP`);
      this.sendMessage(player, `${target.name} stats: ${JSON.stringify(target.totalStats)}`);
    }


  }
}
