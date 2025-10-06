import type { ICharacter, INPC } from '@lotr/interfaces';
import { sample } from 'lodash';

import { DefaultAIBehavior } from './default';

export class InsaneRanataAIBehavior extends DefaultAIBehavior {
  private spawnTicks: boolean[] = [];
  private agroTicks: boolean[] = [];
  private insanes: INPC[] = [];

  public get livingInsanes(): INPC[] {
    return this.insanes
      .filter((ac: INPC) => !this.game.characterHelper.isDead(ac))
      .filter(Boolean);
  }

  override mechanicTick(): void {
    const npc = this.npc;

    for (let i = 1; i < 20; i++) {
      if (
        npc.hp.current < npc.hp.maximum * ((i * 5) / 100) &&
        !this.spawnTicks[i]
      ) {
        this.spawnTicks[i] = true;
        this.spawnInsanes();
      }
    }

    for (let i = 1; i < 10; i++) {
      if (
        npc.hp.current < npc.hp.maximum * ((i * 10) / 100) &&
        !this.agroTicks[i]
      ) {
        this.agroTicks[i] = true;
        this.fixateOnRandom();
      }
    }

    if (
      this.game.effectHelper.hasEffect(npc, 'Invulnerable') &&
      this.livingInsanes.length === 0
    ) {
      this.game.effectHelper.removeEffectByName(npc, 'Invulnerable');
    }
  }

  override damageTaken(): void {}

  override death(): void {
    const npc = this.npc;

    this.game.messageHelper.sendMessageToMap(npc.map, {
      from: npc.name,
      message: 'No! Not like this! I have so many more experiments!',
    });
    this.game.messageHelper.sendMessageToMap(npc.map, {
      message: 'You hear a lock click in the distance.',
    });

    const chestDoor = this.game.worldManager
      .getMap(npc.map)
      ?.map.findInteractableByName('Chest Door');
    chestDoor.properties.requireLockpick = false;
  }

  private fixateOnRandom() {
    const npc = this.npc;

    this.resetAgro(true);

    const hostiles =
      this.game.worldManager
        .getMapStateForCharacter(npc)
        ?.getAllHostilesInRange(npc, 4) ?? [];
    if (hostiles.length === 0) {
      this.game.messageHelper.sendMessageToMap(npc.map, {
        from: npc.name,
        message: 'Oh? Have you all run away? Do not anger me!',
      });
      return;
    }

    const target = sample(hostiles) as ICharacter;
    this.game.characterHelper.addAgro(npc, target, 100000);

    this.game.messageHelper.sendMessageToMap(npc.map, {
      from: npc.name,
      message: `Gwahahaha, ${target.name}, you are my next target!`,
    });
    this.game.messageHelper.sendBannerMessageToPlayer(target, {
      message: "You're Ranata's next target!",
    });
  }

  private spawnInsanes() {
    const npc = this.npc;

    this.game.effectHelper.addEffect(npc, npc, 'Invulnerable');
    this.game.messageHelper.sendMessageToMap(npc.map, {
      from: npc.name,
      message: 'Gwahahaha, come forth, my experiments!',
    });

    this.game.messageHelper.sendBannerMessageToMap(npc.map, {
      message: 'Kill the experiments to make Ranata vulnerable!',
    });

    const spawner = this.game.worldManager
      .getMap(npc.map)
      ?.state.getNPCSpawnerByName('Insane Spawner');
    for (let i = 0; i < 5; i++) {
      const ins = spawner?.forceSpawnNPC();
      if (ins) {
        this.insanes.push(ins);
      }
    }
  }
}
