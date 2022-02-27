
import { sampleSize } from 'lodash';

import { ICharacter, IMacroCommandArgs, IPlayer, ItemSlot, PhysicalAttackArgs, WeaponClasses } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class Blindstrike extends SpellCommand {

  override aliases = ['blindstrike', 'art blindstrike'];
  override requiresLearn = true;

  override range(char: ICharacter) {
    return this.calcPlainAttackRange(char);
  }

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    const weapon = player.items.equipment[ItemSlot.RightHand];
    if (!weapon) return this.sendMessage(player, 'You need a weapon in your hand to blindstrike!');

    const weaponClass = this.game.itemHelper.getItemProperty(weapon, 'itemClass');
    if (!WeaponClasses.includes(weaponClass)) return this.sendMessage(player, 'You need a weapon in your hand to blindstrike!');

    const range = this.range(player);
    if (range === -1) return this.sendMessage(player, 'You need to have your left hand empty to use that weapon!');

    this.use(player, player, { attackRange: 0 });
  }

  override use(user: ICharacter, target: ICharacter, opts: PhysicalAttackArgs = {}): void {

    const state = this.game.worldManager.getMapStateForCharacter(user);
    if (!state) return;

    const numTargets = 1;
    const targets = state.getAllInRangeWithoutVisibilityTo(user, 0, [user.uuid]);
    const foundTargets = sampleSize(targets, numTargets);

    if (foundTargets.length === 0) {
      this.sendMessage(user, 'You swing your weapon wildly, hitting no one!');
      return;
    }

    foundTargets.forEach(chosenTarget => {
      this.game.combatHelper.physicalAttack(user, chosenTarget, { ...opts, damageMult: 0.75 });
    });


  }

}
