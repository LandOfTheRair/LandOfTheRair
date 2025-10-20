import { itemIsOwnedBy, itemPropertiesGet } from '@lotr/content';
import { MacroCommand } from '@lotr/core';
import type { IMacroCommandArgs, IPlayer } from '@lotr/interfaces';
import { ItemClass, ObjectType, SwimLevel } from '@lotr/interfaces';

export class Fill extends MacroCommand {
  override aliases = ['fill'];
  override canBeInstant = false;
  override canBeFast = false;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    if (!args.stringArgs) args.stringArgs = 'right';

    args.stringArgs = args.stringArgs.toLowerCase();

    if (!['right', 'left'].includes(args.stringArgs)) {
      return this.sendMessage(
        player,
        'You do not have anything to fill there!',
      );
    }

    const item = player.items.equipment[args.stringArgs + 'Hand'];
    if (!item) {
      return this.sendMessage(player, 'You do not have anything in that hand!');
    }

    const { itemClass, ounces } = itemPropertiesGet(item, [
      'itemClass',
      'ounces',
    ]);
    if (itemClass !== ItemClass.Bottle) {
      return this.sendMessage(player, 'You do not have a bottle in that hand!');
    }

    if (!itemIsOwnedBy(player, item)) {
      return this.sendMessage(player, 'That is not yours!');
    }

    if ((ounces ?? 0) > 0) {
      return this.sendMessage(player, 'That bottle is not empty!');
    }

    const fillable = this.game.worldManager
      .getMap(player.map)
      ?.map.getInteractableOfTypeAt(player.x, player.y, ObjectType.Fillable);

    let effect = 'FillNormalWater';
    let desc = 'filled with water';

    const effects = {
      [SwimLevel.ChillWater]: 'FillChilledWater',
      [SwimLevel.Lava]: 'FillLava',
      [SwimLevel.NormalWater]: 'FillNormalWater',
      [SwimLevel.SpringWater]: 'FillSpringWater',
    };

    const descs = {
      [SwimLevel.ChillWater]: 'filled with frosty water',
      [SwimLevel.Lava]: 'somehow filled with lava',
      [SwimLevel.NormalWater]: 'filled with water',
      [SwimLevel.SpringWater]: 'filled with spring water',
    };

    effect = effects[player.swimLevel];
    desc = descs[player.swimLevel];

    if (fillable) {
      effect = fillable.properties.fillEffect;
      desc = fillable.properties.fillDesc;
    }

    item.mods.ounces = 1;
    item.mods.value = 1;
    item.mods.useEffect = {
      name: effect,
    };

    item.mods.desc = desc;

    this.sendMessage(
      player,
      `The bottle in your ${args.stringArgs} hand is now ${desc}.`,
    );
  }
}
