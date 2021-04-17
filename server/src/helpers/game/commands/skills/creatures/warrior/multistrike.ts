
import { sampleSize } from 'lodash';

import { ICharacter, IMacroCommandArgs, IPlayer, ItemSlot, PhysicalAttackArgs, WeaponClasses } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class Multistrike extends SpellCommand {

  override aliases = ['multistrike', 'art multistrike'];
  override requiresLearn = true;

  override range(char: ICharacter) {
    return this.calcPlainAttackRange(char);
  }

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    const weapon = player.items.equipment[ItemSlot.RightHand];
    if (!weapon) return this.sendMessage(player, 'You need a weapon in your hand to multistrike!');

    const weaponClass = this.game.itemHelper.getItemProperty(weapon, 'itemClass');
    if (!WeaponClasses.includes(weaponClass)) return this.sendMessage(player, 'You need a weapon in your hand to multistrike!');

    const range = this.range(player);
    if (range === -1) return this.sendMessage(player, 'You need to have your left hand empty to use that weapon!');

    this.use(player, player, { attackRange: 0 });
  }

  override use(user: ICharacter, target: ICharacter, opts: PhysicalAttackArgs = {}): void {

    const state = this.game.worldManager.getMapStateForCharacter(user);

    const numTargets = 4 + this.game.traitHelper.traitLevelValue(user, 'Multitarget');
    const targets = state.getAllHostilesInRange(user, 0);
    const foundTargets = sampleSize(targets, numTargets);

    if (foundTargets.length === 0) {
      this.sendMessage(user, 'You swing your weapon wildly, hitting no one!');
      return;
    }

    foundTargets.forEach(chosenTarget => {
      this.game.combatHelper.physicalAttack(user, chosenTarget, { ...opts, damageMult: 0.5 });
    });

    const defensePenalty = 50 - this.game.traitHelper.traitLevelValue(user, 'Multifocus');
    if (defensePenalty > 0) {
      this.game.effectHelper.addEffect(user, user, 'LoweredDefenses', { effect: { extra: { potency: defensePenalty } } });
    }


  }

}
