
import { sample } from 'lodash';

import { distanceFrom, ICharacter } from '../../../../../../../interfaces';
import { Player } from '../../../../../../../models';
import { SpellCommand } from '../../../../../../../models/macro';

export class DedlaenCryptThingPunch extends SpellCommand {

  override aliases = ['dedlaencryptthingpunch'];
  override requiresLearn = true;

  override canUse(char: ICharacter, target: ICharacter) {
    return distanceFrom(char, target) === 0;
  }

  override use(executor: ICharacter, target: ICharacter) {
    if (this.game.characterHelper.isPlayer(executor)) return;
    if (!this.game.diceRollerHelper.OneInX(20)) return;

    this.game.characterHelper.engageInCombat(executor, 60);

    const allSpots = this.game.worldManager.getMap(executor.map)?.map.findAllDecorByName('CryptThing Spot') ?? [];
    if (allSpots.length > 0) {
      this.game.messageHelper.sendLogMessageToRadius(executor, 6, { message: `${target.name} was cast into a tear in the rift!` });
      const spot = sample(allSpots);

      const x = spot.x / 64;
      const y = (spot.y / 64) - 1;
      this.game.teleportHelper.setCharXY(target, x, y);

      if (this.game.characterHelper.isPlayer(target)) {
        this.game.playerHelper.resetStatus(target as Player, { sendFOV: false });
        this.game.transmissionHelper.sendMovementPatch(target as Player);
      }
    }
  }
}
