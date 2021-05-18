import { IMacroCommandArgs, IPlayer, ObjectType, SwimLevel } from '../../../../interfaces';
import { MacroCommand } from '../../../../models/macro';

export class Quaff extends MacroCommand {

  override aliases = ['quaff'];
  override canBeInstant = false;
  override canBeFast = false;

  override execute(player: IPlayer, args: IMacroCommandArgs) {

    if (this.game.effectHelper.hasEffect(player, 'Drowning')) {
      this.sendMessage(player, 'You have a bit too much going on for that right now!');
    }

    const fillable = this.game.worldManager.getMap(player.map)?.map.getInteractableOfTypeAt(player.x, player.y, ObjectType.Fillable);

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

    this.game.effectHelper.addEffect(player, player, effect);
  }
}
