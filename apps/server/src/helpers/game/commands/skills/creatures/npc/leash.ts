import { isPlayer } from '@lotr/characters';
import type { ICharacter } from '@lotr/interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class Leash extends SpellCommand {
  override aliases = ['leash'];
  override requiresLearn = true;

  override canUse(): boolean {
    return true;
  }

  override mpCost(): number {
    return 0;
  }

  override use(executor: ICharacter) {
    if (isPlayer(executor)) return;

    const state = this.game.worldManager.getMap(executor.map)?.state;
    if (!state) return;

    const spawner = state.getNPCSpawner(executor.uuid);
    if (!spawner) return;

    spawner?.getNPCAI(executor.uuid).sendLeashMessage();

    const oldX = executor.x;
    const oldY = executor.y;

    executor.x = spawner.pos.x;
    executor.y = spawner.pos.y;

    state.moveNPCOrPlayer(executor, { oldX, oldY });
  }
}
