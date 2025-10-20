import { SpellCommand } from '@lotr/core';
import type { IMacroCommandArgs, IPlayer } from '@lotr/interfaces';

export class EnergyWave extends SpellCommand {
  override aliases = ['energywave', 'cast energywave'];
  override requiresLearn = true;
  override canTargetSelf = true;
  override spellRef = 'EnergyWave';

  // aoe targetting won't work for enemies
  override canUse(): boolean {
    return false;
  }

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    this.sendMessage(player, 'You release a surge of energy!');

    args.stringArgs = player.uuid;
    this.castSpell(player, args);
  }
}
