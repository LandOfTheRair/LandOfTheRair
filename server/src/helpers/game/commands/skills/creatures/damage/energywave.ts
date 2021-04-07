import { IMacroCommandArgs, IPlayer } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class EnergyWave extends SpellCommand {

  override aliases = ['energywave', 'cast energywave'];
  override requiresLearn = true;
  override spellRef = 'EnergyWave';

  // aoe targetting won't work for enemies
  override canUse(): boolean {
    return false;
  }

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    this.sendMessage(player, 'You release a surge of energy!');

    args.stringArgs = player.name;
    this.castSpell(player, args);
  }

}
