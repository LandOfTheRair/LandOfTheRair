import { Hostility, ICharacter, INPC, IStatusEffect, ItemSlot, Skill, Stat } from '../../../../../interfaces';
import { Effect, Spawner } from '../../../../../models';

export class FindFamiliar extends Effect {

  public override create(char: ICharacter, effect: IStatusEffect) {

    const mapData = this.game.worldManager.getMap(char.map);
    if (!mapData) return;

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

      // buff based on traits
      npc.stats[Stat.HP] = (npc.stats[Stat.HP] ?? 20000) * 1 + this.game.traitHelper.traitLevelValue(char, 'FamiliarFortitude');
      npc.stats[Stat.STR] = (npc.stats[Stat.STR] ?? 5) + this.game.traitHelper.traitLevelValue(char, 'FamiliarStrength');
      npc.stats[Stat.INT] = (npc.stats[Stat.INT] ?? 5) + this.game.traitHelper.traitLevelValue(char, 'FamiliarStrength');
      npc.stats[Stat.WIS] = (npc.stats[Stat.WIS] ?? 5) + this.game.traitHelper.traitLevelValue(char, 'FamiliarStrength');

      if (this.game.traitHelper.traitLevel(char, 'FamiliarFists')) {
        npc.usableSkills.push({ result: 'Rapidpunch', chance: 1 } as any);
      }

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

    const pets = char.pets;

    if (!pets || !pets.length || pets.every(x => this.game.characterHelper.isDead(x))) {
      this.game.effectHelper.removeEffect(char, effect);
      return;
    }

    // shadow clones do something special
    pets.forEach(pet => {
      if (pet.npcId !== 'Thief Shadow Clone') return;

      const tryToCloneItem = (itemSlot: ItemSlot) => {
        const itemRef = char.items.equipment[itemSlot];

        // don't do anything if it's the same item
        if (pet.items.equipment[itemSlot]?.name === itemRef?.name) return;

        // try to copy the item
        if (itemRef && this.game.itemHelper.canGetBenefitsFromItem(char, itemRef)) {
          const copyItem = this.game.itemCreator.rerollItem(itemRef);
          copyItem.mods.destroyOnDrop = true;
          copyItem.mods.owner = '';
          copyItem.mods.requirements = {};

          this.game.characterHelper.setEquipmentSlot(pet, itemSlot, copyItem);

        } else if (!itemRef) {
          this.game.characterHelper.setEquipmentSlot(pet, itemSlot, undefined);

        }
      };

      tryToCloneItem(ItemSlot.RightHand);
      tryToCloneItem(ItemSlot.LeftHand);

    });
  }

  public override unapply(char: ICharacter, effect: IStatusEffect) {
    char.pets?.forEach(pet => {
      pet.hp.current = 0;
    });

    char.pets = [];
  }

}
