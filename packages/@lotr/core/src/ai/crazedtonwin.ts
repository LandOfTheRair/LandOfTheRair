import { sample } from 'lodash';

import { isDead } from '@lotr/characters';
import { hasEffect } from '@lotr/effects';
import type { INPC } from '@lotr/interfaces';
import { worldGetMapAndState } from '../worldstate';
import { DefaultAIBehavior } from './default';

export class CrazedTonwinAIBehavior extends DefaultAIBehavior {
  private trigger75 = false;
  private trigger50 = false;
  private trigger25 = false;

  private brotherSpawns = [
    {
      spawnLoc: 0,
      id: 'Shadow Takwin',
      effect: 'BrotherlySword',
      message: 'My sword for you, brother!',
    },
    {
      spawnLoc: 1,
      id: 'Shadow Telwin',
      effect: 'BrotherlyShield',
      message: 'My shield for you, brother!',
    },
    {
      spawnLoc: 2,
      id: 'Shadow Terwin',
      effect: 'BrotherlySpeed',
      message: 'My speed for you, brother!',
    },
  ];

  private brothers: INPC[] = [];

  public get livingBrothers(): INPC[] {
    return this.brothers.filter((ac: INPC) => !isDead(ac)).filter(Boolean);
  }

  override mechanicTick(): void {
    const npc = this.npc;
    const hpPercent = (npc.hp.current / npc.hp.maximum) * 100;

    if (!this.trigger75 && hpPercent <= 75) {
      this.trigger75 = true;
      this.spawnBrother();
    }

    if (!this.trigger50 && hpPercent <= 50) {
      this.trigger50 = true;
      this.spawnBrother();
      this.unsheatheOffhand();
    }

    if (!this.trigger25 && hpPercent <= 25) {
      this.trigger25 = true;
      this.spawnBrother();
    }

    if (hasEffect(npc, 'Invulnerable') && this.livingBrothers.length === 0) {
      this.game.effectHelper.removeEffectByName(npc, 'Invulnerable');
    }
  }

  override damageTaken(): void {}

  override death(): void {
    const npc = this.npc;

    this.game.messageHelper.sendMessageToMap(npc.map, {
      from: npc.name,
      message: 'EeeaAAaarrrGGGgghhhh!',
    });
    this.game.messageHelper.sendMessageToMap(npc.map, {
      message: 'You hear a lock click in the distance.',
    });

    const chestDoor = worldGetMapAndState(npc.map).map?.findInteractableByName(
      'Chest Door',
    );
    chestDoor.properties.requireLockpick = false;
  }

  private unsheatheOffhand() {
    const itemChoice = sample([
      'Crazed Tonwin Shield',
      'Crazed Tonwin Flail',
    ]) as string;
    const item = this.game.itemCreator.getSimpleItem(itemChoice);
    this.game.characterHelper.setLeftHand(this.npc, item);
  }

  private spawnBrother() {
    const npc = this.npc;

    const spawnObj = sample(this.brotherSpawns);
    if (!spawnObj) {
      throw new Error(
        `Invalid spawn obj, ${JSON.stringify(this.brotherSpawns)} is left`,
      );
    }

    const { spawnLoc, id, effect, message } = spawnObj;

    // make it so that brother can't spawn again
    this.brotherSpawns = this.brotherSpawns.filter((data) => data.id !== id);

    const msgObject = {
      from: npc.name,
      message: `BROTHER ${id.split(' ')[1]!.toUpperCase()}! JOIN ME!`,
      subClass: 'chatter',
    };
    this.game.messageHelper.sendMessageToMap(npc.map, msgObject);

    let brother: INPC | null;

    const npcSpawner = worldGetMapAndState(npc.map).state?.getNPCSpawnerByName(
      `Brother Spawner ${spawnLoc + 1}`,
    );
    if (npcSpawner) {
      brother = npcSpawner.forceSpawnNPC({ npcId: id });
    }

    if (brother!) {
      this.brothers[spawnLoc] = brother;

      this.game.effectHelper.addEffect(brother, brother, effect);
      this.game.effectHelper.addEffect(npc, brother, effect);
      this.game.effectHelper.addEffect(npc, brother, 'Invulnerable');

      const mapRef = worldGetMapAndState(npc.map);
      mapRef.state?.openDoor(
        mapRef.map?.findInteractableByName(`Tile Door ${spawnLoc + 1}`).id,
      );

      const msgObject2 = { from: brother.name, message, subClass: 'chatter' };
      this.game.messageHelper.sendMessageToMap(npc.map, msgObject2);

      this.game.messageHelper.sendBannerMessageToMap(npc.map, {
        message: `Kill ${id.split(' ')[1]} to make Tonwin vulnerable!`,
      });
    }
  }
}
