import { Hostility, ICharacter, INPC, IStatusEffect, Skill } from '../../../../../interfaces';
import { Effect, Spawner } from '../../../../../models';

export class FindFamiliar extends Effect {

  public override create(char: ICharacter, effect: IStatusEffect) {

    const mapData = this.game.worldManager.getMap(char.map);
    const potency = char.level;

    const npcCreateCallback = (npc: INPC) => {
      npc.allegianceReputation = char.allegianceReputation;
      npc.allegiance = char.allegiance;
      npc.alignment = char.alignment;
      npc.level = char.level;

      // match the player
      if (this.game.characterHelper.isPlayer(char)) {
        npc.allegianceReputation.Enemy = -100000;
        npc.hostility = Hostility.Faction;
      } else {
        npc.hostility = (char as INPC).hostility;
      }

      npc.name = `pet ${npc.name}`;
      npc.affiliation = `${char.name}'s Pet`;

      const skillBoost = Math.floor(((char.skills[Skill.Restoration] ?? 0) + (char.skills[Skill.Conjuration] ?? 0)) / 2);

      Object.keys(npc.skills).forEach(skillName => {
        npc.skills[skillName] += skillBoost;
      });

      // boost stats and skills for npcs
      const def = this.game.npcHelper.getNPCDefinition(npc.npcId);

      Object.keys(def?.summonSkillModifiers || {}).forEach(skillMod => {
        const boost = this.game.calculatorHelper.calculateSkillXPRequiredForLevel(potency * (def.summonSkillModifiers?.[skillMod] ?? 0));
        npc.skills[skillMod] += boost;
      });

      Object.keys(def?.summonStatModifiers || {}).forEach(statMod => {
        const boost = Math.floor(potency * (def.summonStatModifiers?.[statMod] ?? 0));
        npc.stats[statMod] += boost;
      });

      // buff the npc back to full
      this.game.characterHelper.recalculateEverything(npc);
      this.game.characterHelper.healToFull(npc);
      this.game.characterHelper.manaToFull(npc);

      // mark it as a pet
      this.game.characterHelper.addPet(char, npc);

      // give it an effect to mark it as a pet
      this.game.effectHelper.addEffect(npc, char, 'SummonedPet', { tooltip: { desc: `Summoned by ${char.name}.` } });
    };

    // create a fake spawner that allows infinite range walking that deletes itself
    const spawnerOpts = {
      x: char.x,
      y: char.y,
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
      npcCreateCallback
    } as Partial<Spawner>;

    // summon all creatures individually
    effect.effectInfo.summonCreatures?.forEach(creatureId => {
      const spawner = new Spawner(this.game, mapData.map, mapData.state, {
        npcIds: [creatureId] ?? ['Mage Summon Deer'],
        ...spawnerOpts
      } as Partial<Spawner>);

      mapData.state.addSpawner(spawner);
    });
  }

  public override tick(char: ICharacter, effect: IStatusEffect) {
    super.tick(char, effect);

    if (!char.pets || !char.pets.length || char.pets.every(x => this.game.characterHelper.isDead(x))) {
      this.game.effectHelper.removeEffect(char, effect);
    }
  }

  public override unapply(char: ICharacter, effect: IStatusEffect) {
    char.pets?.forEach(pet => {
      pet.hp.current = 0;
    });

    char.pets = [];
  }

}
