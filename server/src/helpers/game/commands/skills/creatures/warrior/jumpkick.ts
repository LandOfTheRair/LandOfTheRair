import { ICharacter, IMacroCommandArgs, IPlayer, ItemSlot, PhysicalAttackArgs, Stat } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class Jumpkick extends SpellCommand {

  override aliases = ['jumpkick', 'art jumpkick'];
  override requiresLearn = true;

  override range(char: ICharacter) {
    return this.game.characterHelper.getStat(char, Stat.Move);
  }

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    if (!args.stringArgs) return false;

    const weapon = player.items.equipment[ItemSlot.RightHand];
    if (weapon) return this.sendMessage(player, 'You cannot maneuver effectively with an item in your right hand!');

    const target = this.game.targettingHelper.getFirstPossibleTargetInViewRange(player, args.stringArgs);
    if (!target) return this.youDontSeeThatPerson(player, args.stringArgs);

    if (target === player) return;

    this.use(player, target);
  }

  override use(user: ICharacter, target: ICharacter, opts: PhysicalAttackArgs = {}): void {
    this.game.movementHelper.moveTowards(user, target);

    this.game.combatHelper.physicalAttack(user, target, { ...opts, isKick: true });

    if (this.game.traitHelper.traitLevel(user, 'Punchkick')) {
      this.game.combatHelper.physicalAttack(user, target, { ...opts, isPunch: true });
    }
  }

}
