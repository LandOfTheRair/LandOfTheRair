import { ICharacter, INPC } from '../../../../interfaces';
import { Effect } from '../../../../models';

export class Dangerous extends Effect {

  // dangerous creatures not in an instance get pot drops
  override create(char: ICharacter) {
    if (this.game.worldManager.isDungeon(char.map)) return;

    const mapData = this.game.worldManager.getMap(char.map);
    if (!mapData) return;

    if (!mapData.map.region) return;

    const potionDrops = this.game.contentManager.getGameSetting('npcgen', `potionDrops.${mapData.map.region}`) ?? {};
    Object.keys(potionDrops).forEach(potion => {
      (char as INPC).drops?.push({ result: potion, chance: 1, maxChance: potionDrops[potion], noLuckBonus: true });
    });
  }

  // dangerous creatures heal 5% per tick out of combat when there are no hostiles in view
  override tick(char: ICharacter) {
    if (char.combatTicks) return;
    if (this.game.worldManager.getMapStateForCharacter(char).getAllHostilesInRange(char, 4).length > 0) return;
    this.game.characterHelper.heal(char, Math.floor(char.hp.maximum / 20));
  }

  override destroy(char: ICharacter) {
    if (this.game.worldManager.isDungeon(char.map)) return;

    const anticipatedRespawn = new Date();
    const respawnSeconds = this.game.worldManager.getMap(char.map)?.state.getNPCSpawner(char.uuid)?.respawnTimeSeconds ?? 3600;
    anticipatedRespawn.setSeconds(anticipatedRespawn.getSeconds() + respawnSeconds);
    this.game.logsDB.addLogEntry(
      `${(char as INPC).npcId} was killed at ${new Date()}.`,
      { anticipatedRespawn: anticipatedRespawn.toString() }
    );
  }

}
