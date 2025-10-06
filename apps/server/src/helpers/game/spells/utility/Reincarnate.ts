import type { ICharacter, SpellCastArgs } from '@lotr/interfaces';
import { Spell } from '../../../../models/world/Spell';

export class Reincarnate extends Spell {
  override cast(
    caster: ICharacter | null,
    target: ICharacter | null,
    spellCastArgs: SpellCastArgs,
  ): void {
    if (!caster) return;

    const mapRef = this.game.worldManager.getMap(caster.map);
    if (!mapRef) return;

    const validSpawners = mapRef.state.allSpawners.filter(
      (spawner) => spawner.areCreaturesDangerous && !spawner.areAnyNPCsAlive,
    );
    if (validSpawners.length === 0) return;

    validSpawners.forEach((spawner) => {
      spawner.forceSpawnNPC();
      spawner.setTick(0);
    });

    this.sendMessage(caster, { message: 'You have raised the evil dead!' });
  }
}
