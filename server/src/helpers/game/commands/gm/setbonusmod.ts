import { IMacroCommandArgs, IPlayer } from '../../../../interfaces';
import { MacroCommand } from '../../../../models/macro';

export class GMSetBonusMod extends MacroCommand {
  override aliases = ['@setbonusmod', '@sbm'];
  override isGMCommand = true;
  override canBeInstant = false;
  override canBeFast = false;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    if (!args.stringArgs) {
      this.sendMessage(player, 'Syntax: MapName');
      return;
    }

    const [name] = args.arrayArgs;
    if (!name) return this.sendMessage(player, 'You must specify a map name.');

    this.game.worldDB.setMapBonusXPSkillGain(name);

    const isSet = this.game.worldDB.isMapBonusXPSkillGain(name);

    this.sendMessage(
      player,
      `${name} map bonus XP/Skill gain set to ${isSet ? 'enabled' : 'disabled'}.`,
    );
  }
}
