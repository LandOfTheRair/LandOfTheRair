import { itemGetMatchingName, itemPropertyGet } from '@lotr/content';
import { worldMapStateGetForCharacter } from '@lotr/core';
import { getEffect, hasEffect } from '@lotr/effects';
import type {
  ICharacter,
  INPC,
  IPlayer,
  ISpawner,
  IStatusEffect,
} from '@lotr/interfaces';
import { ItemClass } from '@lotr/interfaces';
import { sample, sampleSize, sumBy } from 'lodash';
import type { Player } from '../../../../models';
import { Effect } from '../../../../models';

type LootTier = 'I' | 'II' | 'III';

export class BanditWaves extends Effect {
  override create(char: ICharacter, effect: IStatusEffect): void {
    (char as INPC).noCorpseDrop = true;

    const childSpawners = this.getAllChildSpawners(char);

    childSpawners.forEach((spawner) => {
      spawner.allNPCS.forEach((n) => {
        this.game.deathHelper.fakeNPCDie(n);
      });

      spawner.forceSpawnNPC({
        npcId: `Bandit Cave Child`,
      });
    });

    this.startNewWave(char, effect);
  }

  override tick(char: ICharacter, effect: IStatusEffect) {
    super.tick(char, effect);

    if (this.hasLost(char, effect)) {
      this.handleEncounterLoss(char, effect);
      return;
    }

    if (this.banditsAlive(char) === 0) {
      this.startNewWave(char, effect);
      return;
    }

    this.allPlayers(char).forEach((p) => {
      if (!hasEffect(p, 'BanditWavesPlayerInfo')) {
        this.game.effectHelper.addEffect(p, char, 'BanditWavesPlayerInfo', {
          effect: {
            duration: 1800,
          },
        });
      }

      const playerEffect = getEffect(p, 'BanditWavesPlayerInfo');
      if (playerEffect) {
        playerEffect.endsAt = effect.endsAt;
        playerEffect.tooltip = this.descriptionForPlayers(char, effect);
      }
    });
  }

  override unapply(char: ICharacter, effect: IStatusEffect): void {
    this.handleEncounterLoss(char, effect);
  }

  private allPlayers(char: ICharacter): IPlayer[] {
    return worldMapStateGetForCharacter(char)?.allPlayers ?? [];
  }

  private descriptionForPlayers(
    char: ICharacter,
    effect: IStatusEffect,
  ): string {
    const difficulty = this.getTier(effect);
    const wave = effect.effectInfo.damage ?? 0;
    const childrenAlive = this.childrenAlive(char);
    const banditsAlive = this.banditsAlive(char);

    return `Difficulty ${difficulty} | Wave ${wave}/5
    | Children alive: ${childrenAlive}/3
    | Bandits remaining: ${banditsAlive}`;
  }

  private getTier(effect: IStatusEffect): LootTier {
    switch (effect.effectInfo.potency) {
      case 1:
        return 'I';
      case 2:
        return 'II';
      case 3:
        return 'III';
      default:
        throw new Error(
          `Invalid potency for BanditWaves effect: ${effect.effectInfo.potency}`,
        );
    }
  }

  private startNewWave(char: ICharacter, effect: IStatusEffect): void {
    effect.effectInfo.damage ??= 0;
    effect.effectInfo.damage += 1;

    if (this.hasWon(char, effect)) {
      this.handleEncounterWin(char, effect);
      return;
    }

    this.game.messageHelper.sendMessageBannerAndChatToMap(char.map, {
      message: `Bandit wave ${effect.effectInfo.damage} has started!`,
    });

    this.spawnWaveCreatures(char, effect);
  }

  private spawnWaveCreatures(char: ICharacter, effect: IStatusEffect) {
    const waveNumber = effect.effectInfo.damage ?? 0;
    if (waveNumber > 5) return;

    const isBossWave = this.isBossWave(effect);
    const baseNPCIds = this.getBaseSpawnNPCIds(effect);
    const sapperNPCId = this.getSapperNPCId(effect);
    const leaderNPCId = this.getLeaderNPCId(effect);

    const banditSpawners = this.getAllBanditSpawners(char);

    const chosenBaseSpawners = sampleSize(banditSpawners, 3);
    chosenBaseSpawners.forEach((spawner) => {
      const numNPCs = 3 + effect.effectInfo.potency;
      for (let npcNum = 0; npcNum < waveNumber + numNPCs; npcNum++) {
        spawner.forceSpawnNPC({
          npcId: sample(baseNPCIds)!,
        });
      }
    });

    for (let i = 0; i < waveNumber; i++) {
      sample(banditSpawners)?.forceSpawnNPC({
        npcId: sapperNPCId,
      });
    }

    if (isBossWave) {
      sample(banditSpawners)?.forceSpawnNPC({
        npcId: leaderNPCId,
      });
    }
  }

  private getBaseSpawnNPCIds(effect: IStatusEffect): string[] {
    const tier = this.getTier(effect);
    return [`Bandit Cave Brawler ${tier}`, `Bandit Cave Enforcer ${tier}`];
  }

  private getSapperNPCId(effect: IStatusEffect): string {
    const tier = this.getTier(effect);
    return `Bandit Cave Sapper ${tier}`;
  }

  private getLeaderNPCId(effect: IStatusEffect): string {
    const tier = this.getTier(effect);
    return `Bandit Cave Leader ${tier}`;
  }

  private getAllChildSpawners(char: ICharacter): ISpawner[] {
    return (
      worldMapStateGetForCharacter(char)?.allSpawners.filter((s) =>
        s.spawnerName.includes('Child'),
      ) || []
    );
  }

  private getAllBanditSpawners(char: ICharacter): ISpawner[] {
    return (
      worldMapStateGetForCharacter(char)?.allSpawners.filter(
        (s) =>
          s.spawnerName.includes('Bandit Cave') &&
          !s.spawnerName.includes('Child'),
      ) || []
    );
  }

  private childrenAlive(char: ICharacter): number {
    const childSpawners = this.getAllChildSpawners(char);
    return childSpawners.filter((s) => s.allNPCS.length > 0).length;
  }

  private banditsAlive(char: ICharacter): number {
    const banditSpawners = this.getAllBanditSpawners(char);
    return sumBy(
      banditSpawners,
      (s) => s.allNPCS.filter((n) => n.hp.current > 0).length,
    );
  }

  private isBossWave(effect: IStatusEffect): boolean {
    return effect.effectInfo.damage === 5;
  }

  private hasWon(char: ICharacter, effect: IStatusEffect): boolean {
    return (effect.effectInfo.damage ?? 0) > 5;
  }

  private hasWonPerfectly(char: ICharacter, effect: IStatusEffect): boolean {
    return this.childrenAlive(char) === 3;
  }

  private hasLost(char: ICharacter, effect: IStatusEffect): boolean {
    return (
      this.childrenAlive(char) === 0 ||
      this.allPlayers(char).length === 0 ||
      this.allPlayers(char).every((p) => p.hp.current <= 0)
    );
  }

  private removeAllNPCs(char: ICharacter) {
    worldMapStateGetForCharacter(char)?.allNPCS.forEach((target) => {
      this.game.deathHelper.fakeNPCDie(target);
    });
  }

  private handleEncounterLoss(char: ICharacter, effect: IStatusEffect) {
    if (this.hasWon(char, effect)) return;

    this.game.messageHelper.sendMessageBannerAndChatToMap(char.map, {
      message: `You failed to stop the bandits!`,
    });

    this.removeAllNPCs(char);
  }

  private handleEncounterWin(char: ICharacter, effect: IStatusEffect) {
    const tier = this.getTier(effect);

    this.game.messageHelper.sendMessageBannerAndChatToMap(char.map, {
      message: `You successfully defeated all of the bandits in time!`,
    });

    if (this.hasWonPerfectly(char, effect)) {
      this.allPlayers(char).forEach((p) => {
        this.game.achievementsHelper.achievementEarn(
          p as Player,
          `Perfect Pillage ${tier}`,
        );
      });

      if (tier === 'III') {
        const head = this.game.itemCreator.getSimpleItem(
          'Bandit Cave Leader Head',
        );
        this.game.groundManager.addItemToGround(char.map, char.x, char.y, head);
        this.game.messageHelper.sendMessageToMap(char.map, {
          message: `The bandit leader's head has been dropped on the ground!`,
        });
      }
    }

    const allLoot = this.getLootItemsForTier(tier);

    this.getAllChildSpawners(char).forEach((spawner) => {
      if (!spawner.areAnyNPCsAlive) return;

      const lootItem = sample(allLoot);
      if (!lootItem) return;

      const item = this.game.itemCreator.getSimpleItem(lootItem);
      this.game.groundManager.addItemToGround(
        char.map,
        spawner.pos.x,
        spawner.pos.y,
        item,
      );

      const itemClass = itemPropertyGet(item, 'itemClass') ?? ItemClass.Rock;

      this.game.messageHelper.sendMessageToMap(char.map, {
        message: `Thanks for saving me! I found this ${itemClass.toLowerCase()} on one of the bandits, you can have it!`,
        from: 'scared child',
      });
    });

    this.game.messageHelper.sendMessageToMap(char.map, {
      message: `Thanks for saving the children! I'll take them home now!`,
      from: char.name,
    });

    this.removeAllNPCs(char);
  }

  private getLootItemsForTier(tier: LootTier): string[] {
    const items = itemGetMatchingName('Bandit Cave').filter((item) => {
      const itemName = item.name.split(' ');
      const itemTier = itemName[itemName.length - 1];
      return itemTier === tier && item.itemClass !== ItemClass.Scroll;
    });

    return items.map((item) => item.name);
  }
}
