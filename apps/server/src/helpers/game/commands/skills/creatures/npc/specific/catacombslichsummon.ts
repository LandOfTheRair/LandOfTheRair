import { sample } from 'lodash';

import { isPlayer } from '@lotr/characters';
import { SpellCommand } from '@lotr/core';
import type { ICharacter } from '@lotr/interfaces';

export class CatacombsLichSummon extends SpellCommand {
  override aliases = ['catacombslichsummon'];
  override requiresLearn = true;

  override canUse(char: ICharacter, target: ICharacter) {
    return true;
  }

  override mpCost(): number {
    return 0;
  }

  override use(executor: ICharacter, target: ICharacter) {
    if (isPlayer(executor)) return;

    const state = this.game.worldManager.getMap(executor.map)?.state;
    if (!state) return;

    const lichSpawners = state.getNPCSpawnersByName('Lich Random Spawner');
    if (lichSpawners.length === 0) return;

    const spawner = sample(lichSpawners);
    if (!spawner) return;

    const npc = sample(spawner.allNPCS);
    if (!npc) return;

    this.game.teleportHelper.setCharXY(npc, executor.x, executor.y);
    this.game.messageHelper.sendLogMessageToRadius(target, 8, {
      message: `${npc.name} was summoned through a hole in the rift!`,
    });
  }
}
