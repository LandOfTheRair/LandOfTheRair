import { calculateSkillXPRequiredForLevel } from '@lotr/exp';
import type { ICharacter, INPC, SpellCastArgs } from '@lotr/interfaces';
import { Hostility, ItemClass, Stat } from '@lotr/interfaces';
import { Spawner } from '../../../../models';
import { Spell } from '../../../../models/world/Spell';

export class Resurrect extends Spell {
  override cast(
    caster: ICharacter | null,
    target: ICharacter | null,
    spellCastArgs: SpellCastArgs,
  ): void {
    if (!caster) return;

    let didRevive = false;

    const corpses = this.game.groundManager.getItemsFromGround(
      caster.map,
      caster.x,
      caster.y,
      ItemClass.Corpse,
    );
    corpses.forEach((corpse) => {
      if (corpse.item.mods.corpseUsername || didRevive) return;
      if (!corpse.item.mods.playersHeardDeath?.includes(caster.uuid)) return;
      if ((corpse.item.mods.corpseLevel ?? 0) > caster.level) return;

      this.game.messageHelper.sendSimpleMessage(
        caster,
        'You resurrected a corpse!',
      );

      this.spawnZombie(caster, corpse.item.mods.corpseLevel ?? 1);
      this.game.corpseManager.searchCorpses([corpse.item.uuid]);
      this.game.corpseManager.removeCorpse(corpse.item);
      this.game.groundManager.removeItemFromGround(
        caster.map,
        caster.x,
        caster.y,
        ItemClass.Corpse,
        corpse.item.uuid,
      );

      didRevive = true;
    });

    if (!didRevive) {
      this.game.messageHelper.sendSimpleMessage(
        caster,
        'There are no corpses here that you can resurrect.',
      );
    }
  }

  private spawnZombie(caster: ICharacter, level: number): void {
    const mapData = this.game.worldManager.getMap(caster.map);
    if (!mapData) return;

    const npcCreateCallback = (npc: INPC) => {
      npc.allegianceReputation = caster.allegianceReputation;
      npc.allegiance = caster.allegiance;
      npc.alignment = caster.alignment;
      npc.level = caster.level;
      npc.allegianceReputation.Enemy = -100000;
      npc.hostility = Hostility.Faction;
      npc.affiliation = `${caster.name}'s Zombie`;
      npc.noItemDrop = true;
      npc.noCorpseDrop = true;
      npc.skillOnKill = 0;
      npc.giveXp = { min: 1, max: 1 };

      const skillBoost = calculateSkillXPRequiredForLevel(
        Math.floor(level / 2),
      );
      Object.keys(npc.skills).forEach((skillName) => {
        npc.skills[skillName] += skillBoost;
      });

      npc.stats[Stat.HP] =
        (npc.stats[Stat.HP] ?? 20000) * 1 +
        this.game.traitHelper.traitLevelValue(caster, 'FamiliarFortitude');
      npc.stats[Stat.STR] =
        (npc.stats[Stat.STR] ?? 5) +
        this.game.traitHelper.traitLevelValue(caster, 'FamiliarStrength');
      npc.stats[Stat.INT] =
        (npc.stats[Stat.INT] ?? 5) +
        this.game.traitHelper.traitLevelValue(caster, 'FamiliarStrength');
      npc.stats[Stat.WIS] =
        (npc.stats[Stat.WIS] ?? 5) +
        this.game.traitHelper.traitLevelValue(caster, 'FamiliarStrength');

      // buff the npc back to full
      this.game.characterHelper.recalculateEverything(npc);
      this.game.characterHelper.healToFull(npc);
      this.game.characterHelper.manaToFull(npc);
    };

    const spawnerOpts = {
      name: `Zombie ${caster.name}`,
      x: caster.x,
      y: caster.y,
      maxCreatures: 1,
      respawnRate: 0,
      initialSpawn: 1,
      spawnRadius: 0,
      randomWalkRadius: -1,
      leashRadius: -1,
      shouldStrip: false,
      removeWhenNoNPCs: true,
      removeDeadNPCs: true,
      respectKnowledge: false,
      doInitialSpawnImmediately: true,
      npcCreateCallback,
    } as Partial<Spawner>;

    const spawner = new Spawner(this.game, mapData.map, mapData.state, {
      npcIds: ['Halloween Zombie'],
      ...spawnerOpts,
    } as Partial<Spawner>);

    mapData.state.addSpawner(spawner);

    spawner.tryInitialSpawn();
  }
}
