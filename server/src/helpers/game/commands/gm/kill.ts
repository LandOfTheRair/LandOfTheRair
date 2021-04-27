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

  }
}
