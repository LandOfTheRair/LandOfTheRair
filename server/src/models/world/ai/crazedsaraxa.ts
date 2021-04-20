
import { INPC } from '../../../interfaces';
import { DefaultAIBehavior } from './default';

export class CrazedSaraxaAIBehavior extends DefaultAIBehavior {

  private trigger75 = false;
  private trigger50 = false;
  private trigger25 = false;

  private acolytes: INPC[] = [];

  public get livingAcolytes(): INPC[] {
    return this.acolytes.filter((ac: INPC) => !this.game.characterHelper.isDead(ac)).filter(Boolean);
  }


  override mechanicTick(): void {

    const npc = this.npc;
    const hpPercent = npc.hp.current / npc.hp.maximum * 100;

    // oh yes, these acolytes can respawn
    if (hpPercent >= 90) this.trigger75 = false;
    if (hpPercent >= 65) this.trigger50 = false;
    if (hpPercent >= 40) this.trigger25 = false;

    if (!this.trigger75 && hpPercent <= 75) {
      this.trigger75 = true;

      this.spawnAcolyte(1);
    }

    if (!this.trigger50 && hpPercent <= 50) {
      this.trigger50 = true;

      this.spawnAcolyte(2);
    }

    if (!this.trigger25 && hpPercent <= 25) {
      this.trigger25 = true;

      this.spawnAcolyte(3);
    }
  }

  override damageTaken(): void {

  }

  override death(): void {
    const npc = this.npc;

    this.game.messageHelper.sendMessageToMap(npc.map, { from: npc.name, message: 'EeeaAAaarrrGGGgghhhh!' });
    this.game.messageHelper.sendMessageToMap(npc.map, { message: 'You hear a lock click in the distance.' });

    const chestDoor = this.game.worldManager.getMap(npc.map)?.map.findInteractableByName('Chest Door');
    chestDoor.properties.requireLockpick = false;
  }

  private spawnAcolyte(spawnId: number): void {
    const npc = this.npc;

    if (this.acolytes[spawnId] && !this.game.characterHelper.isDead(this.acolytes[spawnId])) return;

    const msgObject = { from: npc.name, message: 'Come forth, my acolyte!', subClass: 'chatter' };
    this.game.messageHelper.sendMessageToMap(npc.map, msgObject);

    const npcSpawner = this.game.worldManager.getMap(npc.map)?.state.getNPCSpawnerByName(`Acolyte Spawner ${spawnId}`);
    if (npcSpawner) {
      npcSpawner.forceSpawnNPC({ createCallback: (acolyte) => this.acolytes[spawnId] = acolyte });
    }

    const rockySpawner = this.game.worldManager.getMap(npc.map)?.state.getNPCSpawnerByName('Crazed Saraxa Rocky Spawner');
    if (rockySpawner && !rockySpawner.areAnyNPCsAlive) {
      rockySpawner.forceSpawnNPC();
    }

    const msgObject2 = { message: 'The acolyte begins channeling energy back to Saraxa!', subClass: 'environment' };
    this.game.messageHelper.sendMessageToMap(npc.map, msgObject2);

    if (!this.game.effectHelper.hasEffect(npc, 'AcolyteOverseer')) {
      this.game.effectHelper.addEffect(npc, npc, 'AcolyteOverseer');
    }
  }

}
