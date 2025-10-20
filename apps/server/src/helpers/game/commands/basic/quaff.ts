import { MacroCommand, worldGetMapAndState } from '@lotr/core';
import { hasEffect } from '@lotr/effects';
import type { IMacroCommandArgs, IPlayer } from '@lotr/interfaces';
import { ObjectType, SwimLevel } from '@lotr/interfaces';

export class Quaff extends MacroCommand {
  override aliases = ['quaff'];
  override canBeInstant = false;
  override canBeFast = false;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    if (hasEffect(player, 'Drowning')) {
      this.sendMessage(
        player,
        'You have a bit too much going on for that right now!',
      );
    }

    const fillable = worldGetMapAndState(
      player.map,
    ).map?.getInteractableOfTypeAt(player.x, player.y, ObjectType.Fillable);

    let effect = 'FillNormalWater';

    const effects = {
      [SwimLevel.ChillWater]: 'FillChilledWater',
      [SwimLevel.Lava]: 'FillLava',
      [SwimLevel.NormalWater]: 'FillNormalWater',
      [SwimLevel.SpringWater]: 'FillSpringWater',
    };

    effect = effects[player.swimLevel];

    if (fillable) {
      effect = fillable.properties.fillEffect;
    }

    if (!effect) {
      this.sendMessage(
        player,
        "There isn't anything interesting to drink here.",
      );
      return;
    }

    this.game.effectHelper.addEffect(player, player, effect);
  }
}
