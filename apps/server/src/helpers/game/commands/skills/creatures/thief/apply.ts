import type {
  ICharacter,
  IMacroCommandArgs,
  IPlayer } from '@lotr/interfaces';
import {
  ItemSlot,
} from '@lotr/interfaces';
import { SkillCommand } from '../../../../../../models/macro';

export class Apply extends SkillCommand {
  override aliases = ['apply'];

  override canUse(char: ICharacter) {
    return false;
  }

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    const leftHand = player.items.equipment[ItemSlot.LeftHand];
    if (!leftHand) {
return this.sendMessage(
        player,
        'You must hold a bottle in your left hand!',
      );
}

    const { useEffect } = this.game.itemHelper.getItemProperties(leftHand, [
      'useEffect',
    ]);
    if (!useEffect || !useEffect.canApply) {
return this.sendMessage(
        player,
        'That cannot be applied to your weapons!',
      );
}

    this.game.itemHelper.useItemInSlot(player, ItemSlot.LeftHand, false);

    const duration =
      1800 +
      this.game.traitHelper.traitLevelValue(player, 'EnhancedApplications');
    this.game.effectHelper.addEffect(player, '', 'Applied', {
      effect: { duration, extra: { applyEffect: useEffect } },
    });
  }
}
