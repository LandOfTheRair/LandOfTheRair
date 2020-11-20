import { DamageClass, IMacroCommandArgs, IPlayer } from '../../../../interfaces';
import { MacroCommand } from '../../../../models/macro';

export class GMKill extends MacroCommand {

  aliases = ['@kill'];
  isGMCommand = true;
  canBeInstant = false;
  canBeFast = false;

  execute(player: IPlayer, args: IMacroCommandArgs) {

    const target = this.game.targettingHelper.getFirstPossibleTargetInViewRange(player, args.stringArgs);
    if (!target) return this.youDontSeeThatPerson(player);

    this.game.combatHelper.dealOnesidedDamage(target, {
      damage: target.hp.maximum,
      damageClass: DamageClass.GM,
      damageMessage: 'You were extremely killed for no reason!',
      suppressIfNegative: true
    });

  }
}
