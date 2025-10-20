import { itemPropertiesGet, traitLevelValue } from '@lotr/content';
import { SkillCommand } from '@lotr/core';
import type { ICharacter, IMacroCommandArgs, IPlayer } from '@lotr/interfaces';
import { ItemSlot } from '@lotr/interfaces';

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

    const { useEffect } = itemPropertiesGet(leftHand, ['useEffect']);
    if (!useEffect || !useEffect.canApply) {
      return this.sendMessage(
        player,
        'That cannot be applied to your weapons!',
      );
    }

    this.game.itemHelper.useItemInSlot(player, ItemSlot.LeftHand, false);

    const duration = 1800 + traitLevelValue(player, 'EnhancedApplications');
    this.game.effectHelper.addEffect(player, '', 'Applied', {
      effect: { duration, extra: { applyEffect: useEffect } },
    });
  }
}
