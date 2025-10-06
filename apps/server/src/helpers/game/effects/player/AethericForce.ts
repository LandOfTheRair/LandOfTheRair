import type { ICharacter, IStatusEffect } from '@lotr/interfaces';
import type { Player } from '../../../../models';
import { Effect } from '../../../../models';

export class AethericForce extends Effect {
  override create(char: ICharacter, effect: IStatusEffect) {
    const resetTime = this.game.dailyHelper.resetTime;
    effect.endsAt = +resetTime;
  }

  override tick(char: ICharacter) {
    if (this.game.worldManager.isEtherForceMap(char.map)) return;
    this.game.effectHelper.removeEffectByName(char, 'AethericForce');
  }

  override expire(char: ICharacter) {
    const mapData = this.game.worldManager.getMap(char.map);

    // warp to the current map's respawnKick area if possible
    if (mapData?.map.properties.respawnKick) {
      const map = mapData.map.properties.respawnMap;
      const x = mapData.map.properties.respawnX;
      const y = mapData.map.properties.respawnY;

      this.game.teleportHelper.teleport(char as Player, { x, y, map });

      // if there is no respawnKick for this map, we go to FL default safe area for solokar
    } else {
      this.game.teleportHelper.teleport(char as Player, {
        x: 174,
        y: 224,
        map: 'Frostlands',
      });
    }

    this.sendMessage(char, { message: 'The ether forces you out!' });
  }
}
