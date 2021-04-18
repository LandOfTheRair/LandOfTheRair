import { ICharacter, IMacroCommandArgs, IPlayer, ItemSlot, PhysicalAttackArgs, WeaponClasses } from '../../../../../../interfaces';
import { SkillCommand } from '../../../../../../models/macro';

export class Backstab extends SkillCommand {

  override aliases = ['bs', 'backstab'];

  override range(char: ICharacter) {
    return this.calcPlainAttackRange(char);
  }

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    if (!args.stringArgs) return false;

    const hidden = this.game.effectHelper.hasEffect(player, 'Hidden');
    const shadowMeld = this.game.effectHelper.hasEffect(player, 'ShadowMeld');
    if (!hidden && !shadowMeld) return this.sendMessage(player, 'You are not hidden!');

    const weapon = player.items.equipment[ItemSlot.RightHand];
    if (!weapon) return this.sendMessage(player, 'You need a weapon in your hand to backstab!');

    const weaponClass = this.game.itemHelper.getItemProperty(weapon, 'itemClass');
    if (!WeaponClasses.includes(weaponClass)) return this.sendMessage(player, 'You need a weapon in your hand to backstab!');

    const range = this.range(player);
    if (range === -1) return this.sendMessage(player, 'You need to have your left hand empty to use that weapon!');

    const target = this.game.targettingHelper.getFirstPossibleTargetInViewRange(player, args.stringArgs);
    if (!target) return this.youDontSeeThatPerson(player, args.stringArgs);

    if (this.game.visibilityHelper.canSeeThroughStealthOf(target, player)) {
      return this.sendMessage(player, 'You do not have the element of surprise!');
    }

    if (target === player) return;

    if (hidden) this.game.effectHelper.removeEffectByName(player, 'Hidden');
    if (shadowMeld) this.game.effectHelper.removeEffectByName(player, 'Shadowmeld');
    this.use(player, target, { attackRange: range });
  }

  override use(user: ICharacter, target: ICharacter, opts: PhysicalAttackArgs = {}): void {
    this.game.movementHelper.moveTowards(user, target);

    this.game.combatHelper.physicalAttack(user, target, { ...opts, isBackstab: true, attackRange: 0 });
  }

}
