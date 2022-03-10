
import { Injectable } from 'injection-js';
import { random, sample } from 'lodash';

import { Allegiance, basePlayerSprite, Currency, Direction, ICharacter, INPC,
  IPlayer, ISimpleItem, ItemClass, ItemSlot, Skill, Stat, TrackedStatistic } from '../../interfaces';
import { Player } from '../../models';
import { BaseService } from '../../models/BaseService';

@Injectable()
export class DeathHelper extends BaseService {

  public init() {}

  // revive the player from their death
  public restore(player: IPlayer, { x, y, map, shouldRot }: { x?: number; y?: number; map?: string; shouldRot?: boolean } = {}): void {

    // store old pos to look up corpse
    const oldX = player.x;
    const oldY = player.y;
    const oldMap = player.map;

    // remove our corpse if we have one
    if (player.corpseRef) {
      const oldMapState = this.game.worldManager.getMap(oldMap)?.state;
      oldMapState?.removeItemFromGround(oldX, oldY, ItemClass.Corpse, player.corpseRef.uuid);

      if (x && y && map) {
        const newMapState = this.game.worldManager.getMap(map)?.state;
        newMapState?.removeItemFromGround(x, y, ItemClass.Corpse, player.corpseRef.uuid);
      }

      this.game.corpseManager.removeCorpse(player.corpseRef);
      this.game.corpseManager.removeCorpseFromAnyonesHands(player.corpseRef.uuid);
      delete player.corpseRef;
    }

    if (!this.game.characterHelper.isDead(player)) return;

    const bonusHP = Math.min(
      player.hp.maximum,
      Math.floor(player.hp.maximum * this.game.traitHelper.traitLevelValue(player, 'EtherRecombobulation'))
    );

    player.hp.current = 1 + bonusHP;
    player.dir = Direction.South;

    // we *must* remove the Dead effect before reviving, otherwise the handlers for leaving maps etc will go bonkers
    this.game.effectHelper.removeEffectByName(player, 'Dead');

    // we're being revived
    if (x && y && map) {
      this.game.teleportHelper.teleport(player as Player, { x, y, map });

    // tele to respawn point (maybe), then reset some vars
    } else {

      // first, we check if the map is a "respawnKick" map, which means it will kick us back to the maps specified respawn time
      const mapData = this.game.worldManager.getMap(player.map);
      const props = mapData?.map.properties;

      if (props && props.respawnKick && props.kickMap && props.kickX && props.kickY) {
        const respawnMap = props.kickMap;
        const respawnX = props.kickX ?? 0;
        const respawnY = props.kickY ?? 0;

        this.game.teleportHelper.teleport(player as Player, { x: respawnX, y: respawnY, map: respawnMap });

      // if it isn't, then we can teleport to our respawn point
      } else {
        this.game.teleportHelper.teleportToRespawnPoint(player as Player);

      }
    }

    this.game.characterHelper.tryToCastEquipmentEffects(player);

    const invulnDuration = 3 + this.game.traitHelper.traitLevelValue(player, 'RecombobulativeBarrier');
    this.game.effectHelper.addEffect(player, '', 'LimitedInvulnerability', { effect: { duration: invulnDuration } });

    // if we rotted... deal with that
    if (shouldRot) {
      this.game.messageHelper.sendLogMessageToPlayer(player, { message: 'You feel a churning sensation...' });

      const strLossChance = this.game.contentManager.getGameSetting('corpse', 'rotStrLossChance') ?? 5;

      if ((player.stats?.[Stat.STR] ?? 0) > 5 && this.game.diceRollerHelper.OneInX(strLossChance)) {
        this.game.characterHelper.losePermanentStat(player, Stat.STR, 1);
      }

      const agiLossChance = this.game.contentManager.getGameSetting('corpse', 'rotAgiLossChance') ?? 5;

      if ((player.stats?.[Stat.AGI] ?? 0) > 5 && this.game.diceRollerHelper.OneInX(agiLossChance)) {
        this.game.characterHelper.losePermanentStat(player, Stat.AGI, 1);
      }
    }
  }

  // dying functions
  public die(dead: ICharacter, killer?: ICharacter): void {
    if (!this.game.characterHelper.isDead(dead)) return;
    if (dead.hp.current === -1) return;

    dead.hp.current = -1;
    delete dead.spellChannel;

    this.game.effectHelper.clearEffectsForDeath(dead);
    dead.dir = Direction.Center;
    dead.combatTicks = 0;

    const corpse = this.createCorpse(dead, killer);

    if (this.game.characterHelper.isPlayer(dead)) {
      const shouldMakeCorpse = ((killer as INPC)?.shouldEatTier ?? 0) <= 0;
      this.playerDie(dead as IPlayer, shouldMakeCorpse ? corpse as ISimpleItem : undefined, killer);
    } else {
      this.npcDie(dead as INPC, corpse, killer);
    }
  }

  // mark last death location, add dead effect, clear action queue, check low con, drop hands if npc killed me
  private playerDie(dead: IPlayer, corpse?: ISimpleItem, killer?: ICharacter): void {
    this.game.playerHelper.clearActionQueue(dead as Player);

    this.game.statisticsHelper.addStatistic(dead, TrackedStatistic.Deaths);

    dead.lastDeathLocation = { map: dead.map, x: dead.x, y: dead.y };
    const deathTimer = this.game.contentManager.getGameSetting('corpse', 'playerExpire') ?? 500;
    this.game.effectHelper.addEffect(dead, killer?.name ?? '', 'Dead', { effect: { duration: deathTimer } });
    dead.dir = Direction.Center;

    if (corpse) {
      dead.corpseRef = corpse;

      const state = this.game.worldManager.getMap(dead.map)?.state;
      state?.addItemToGround(dead.x, dead.y, corpse);

    } else {

      this.game.teleportHelper.teleportToRespawnPoint(dead as Player);
      // this.restore(dead);
    }

    // lose a CON if you die (min of 1)
    this.game.characterHelper.losePermanentStat(dead, Stat.CON, 1);

    // get a warning if your CON is too low
    if (this.game.characterHelper.getBaseStat(dead, Stat.CON) <= 3) {
      this.game.effectHelper.addEffect(dead, '', 'LowCON');

      // and lose max hp if you keep dying
      if (this.game.characterHelper.getBaseStat(dead, Stat.HP) > 10) {
        this.game.characterHelper.losePermanentStat(dead, Stat.HP, 1);
      }
    }

    // drop your hand items
    if (killer && !this.game.characterHelper.isPlayer(killer)) {
      this.game.characterHelper.dropHands(dead);
    }

    this.game.characterHelper.calculateStatTotals(dead);
  }

  // fake kill an NPC - good for removing them with dropping no loot
  public fakeNPCDie(dead: INPC): void {
    this.game.effectHelper.clearEffectsForDeath(dead);
    dead.hp.current = -1;
    dead.dir = Direction.Center;
    dead.noItemDrop = true;
    dead.noCorpseDrop = true;
    this.npcDie(dead);
  }

  // dispatch ai death, calculate loot drops
  // corpses are optional, since some enemies might not have any - in this case, drop loot on ground
  public npcDie(dead: INPC, corpse?: ISimpleItem, killer?: ICharacter): void {

    const ai = this.game.worldManager.getMap(dead.map)?.state.getNPCSpawner(dead.uuid)?.getNPCAI(dead.uuid);
    ai?.death(killer);

    if (!dead.noItemDrop) {
      const state = this.game.worldManager.getMap(dead.map)?.state;
      if (!state) return;

      const allItems: ISimpleItem[] = [];

      // always drop gold
      const goldHeld = dead.currency?.[Currency.Gold] ?? 0;
      if (goldHeld > 0) {
        const gold = this.game.itemCreator.getGold(goldHeld);
        allItems.push(gold);
      }

      // we always add the sack
      if (dead.items.sack.items.length > 0) {
        allItems.push(...dead.items.sack.items);
      }

      const bonus = killer ? this.game.diceRollerHelper.OneToLUK(killer) : 0;

      // roll items for the npc specifically
      const rolledItems = this.game.lootHelper.getNPCLoot(dead, bonus);
      allItems.push(...rolledItems);

      // attach items to corpse and put that on the ground
      if (corpse) {
        const baseNPC = this.game.npcCreator.getNPCDefinition(dead.npcId);

        corpse.mods.searchItems = allItems;
        corpse.mods.tansFor = dead.tansFor || '';
        corpse.mods.corpseLevel = baseNPC?.level ?? dead.level;
        corpse.mods.playersHeardDeath = state.getAllPlayersInRange(dead, 4).map(x => x.uuid);
        state.addItemToGround(dead.x, dead.y, corpse);

      // drop items on ground
      } else {
        state.addItemsToGround(dead.x, dead.y, allItems);
      }
    }
  }

  // killin'
  public kill(killer: ICharacter, dead: ICharacter): void {
    if (!this.game.characterHelper.isDead(dead)) return;

    if (this.game.characterHelper.isPlayer(killer)) {
      this.playerKill(killer as IPlayer, dead);
    } else {
      if ((killer as INPC).owner) {
        this.playerKill((killer as INPC).owner as IPlayer, dead);
      } else {
        this.npcKill(killer as INPC, dead);
      }
    }
  }

  // clear action queue of the dead uuid
  private playerKill(killer: IPlayer, dead: ICharacter): void {
    this.game.playerHelper.clearActionQueue(killer as Player, dead.uuid);
    if (this.game.characterHelper.isPlayer(dead)) return;

    this.game.statisticsHelper.addStatistic(killer, TrackedStatistic.Kills);

    if (this.game.effectHelper.hasEffect(dead, 'Dangerous')) {
      this.game.statisticsHelper.addStatistic(killer, TrackedStatistic.KillsLair);
    }

    const npc: INPC = dead as INPC;

    const earnedExp = random(npc.giveXp.min, npc.giveXp.max);

    const gainKillRewards = (rewarded: IPlayer, multiplier = 1) => {

      if (rewarded.level - npc.level <= 5) {
        this.game.playerHelper.gainAxp(rewarded, this.game.calculatorHelper.calcAXPRewardFor(npc));
      }

      this.game.questHelper.tryUpdateQuestProgressForKill(rewarded, npc.npcId);

      const mult = this.game.playerHelper.expMultiplierForMap(rewarded);
      this.game.playerHelper.gainExp(rewarded, earnedExp * multiplier * mult);

      rewarded.flaggedSkills = rewarded.flaggedSkills.filter(x => this.game.playerHelper.canGainSkillOnMap(rewarded, x));
      this.game.playerHelper.gainCurrentSkills(rewarded, npc.skillOnKill * multiplier);

      npc.allegianceMods.forEach(({ delta, allegiance }) => {
        this.game.playerHelper.modifyReputationForAllegiance(rewarded, allegiance, delta);
      });
    };

    gainKillRewards(killer);

    const partyMembers = this.game.partyHelper.getAllPartyMembersInRange(killer);
    const partyMultiplier = this.game.partyHelper.getTotalXPMultiplier(killer);

    partyMembers.forEach(otherPlayer => {
      gainKillRewards(otherPlayer, partyMultiplier);
    });
  }

  // try to strip, try to eat
  private npcKill(killer: INPC, dead: ICharacter): void {

    // clear the agro when something is killed by an npc
    this.game.characterHelper.clearAgro(killer, dead);
    this.game.characterHelper.clearAgro(dead, killer);

    // if they can strip, they strip
    if (killer.shouldStrip && killer.stripX && killer.stripY) {
      this.strip(dead, killer.stripX, killer.stripY, killer.stripRadius);
    }

    // if they can eat, they eat
    const eatTier = killer.shouldEatTier ?? 0;

    if (eatTier > 0) {
      this.game.messageHelper.sendLogMessageToPlayer(dead, { message: `${killer.name} makes a quick meal out of you!` });

      const { eatXpLossMultiplier, eatSkillLossMultiplier } = this.game.contentManager.getGameSetting('corpse');

      const lostXP = Math.floor((this.game.calculatorHelper.calculateXPRequiredForLevel(dead.level) * eatXpLossMultiplier) * eatTier);
      const lostSkill = Math.floor(eatSkillLossMultiplier * eatTier);
      const randomSkill = sample(Object.keys(dead.skills)) as Skill;

      this.game.characterHelper.losePermanentStat(dead, Stat.HP, Math.floor(eatTier));

      this.game.playerHelper.loseExp(dead as IPlayer, lostXP);
      this.game.playerHelper.loseSkill(dead as IPlayer, randomSkill, lostSkill);
    }
  }

  // strip a character to a location w/ a radius
  private strip(character: ICharacter, x: number, y: number, radius = 0): void {
    if (this.game.effectHelper.hasEffect(character, 'SecondWind')) return;

    if (this.game.characterHelper.isPlayer(character)) {
      this.game.statisticsHelper.addStatistic(character as IPlayer, TrackedStatistic.Strips);
    }

    this.game.messageHelper.sendLogMessageToPlayer(character, {
      message: 'You see a flaming wisp dance before your eyes, taking your equipment with it!'
    });

    const { state, x: dropX, y: dropY } = this.game.worldManager.getMapStateAndXYForCharacterItemDrop(character, x, y);

    const pickSlot = () => ({ x: random(dropX - radius, dropX + radius), y: random(dropY - radius, dropY + radius) });

    this.game.characterHelper.dropHands(character);

    const allItemDrops: Array<{ x: number; y: number; item: ISimpleItem }> = [];

    // take the gold
    const goldTotal = this.game.currencyHelper.getCurrency(character, Currency.Gold);
    if (goldTotal > 0) {
      this.game.currencyHelper.loseCurrency(character, goldTotal, Currency.Gold);

      const goldItem = this.game.itemCreator.getGold(goldTotal);
      allItemDrops.push({ ...pickSlot(), item: goldItem });
    }

    // take the gear
    Object.keys(character.items.equipment).forEach(itemSlot => {
      const item = character.items.equipment[itemSlot];
      if (!item) return;

      // potions don't strip
      if (itemSlot === ItemSlot.Potion) return;

      allItemDrops.push({ ...pickSlot(), item });
      this.game.characterHelper.setEquipmentSlot(character, itemSlot as ItemSlot, undefined);
    });

    // take the belt & sack
    const sackItems = character.items.sack.items
      .filter(item => !this.game.itemHelper.getItemProperty(item, 'succorInfo'))
      .map(item => ({ ...pickSlot(), item }));

    this.game.inventoryHelper.removeItemsFromSackByUUID(character, sackItems.map(i => i.item.uuid));
    allItemDrops.push(...sackItems);

    const beltItems = character.items.belt.items
      .filter(item => !this.game.itemHelper.getItemProperty(item, 'succorInfo'))
      .map(item => ({ ...pickSlot(), item }));

    this.game.inventoryHelper.removeItemsFromBeltByUUID(character, beltItems.map(i => i.item.uuid));
    allItemDrops.push(...beltItems);

    // finally, banish them to the ground
    state.addItemsToGroundSpread(allItemDrops, { x: dropX, y: dropY }, radius, true);
  }

  // corpse creating
  private createCorpse(character: ICharacter, killer?: ICharacter): ISimpleItem|undefined {
    if (this.game.characterHelper.isPlayer(character)) {
      if (((killer as INPC)?.shouldEatTier ?? 0) > 0) return undefined;

      return this.createPlayerCorpse(character as IPlayer);

    } else {

      if (character.allegiance === Allegiance.NaturalResource) return undefined;
      return this.createNPCCorpse(character as INPC);
    }
  }

  // make a default corpse
  private createPlayerCorpse(player: IPlayer): ISimpleItem {
    const baseCorpse = this.game.itemCreator.getSimpleItem('Corpse');
    baseCorpse.mods.desc = `the corpse of ${player.name}`;
    baseCorpse.mods.corpseUsername = player.username;
    baseCorpse.mods.sprite = basePlayerSprite(player) + 4;

    return baseCorpse;
  }

  // create npc corpse
  private createNPCCorpse(npc: INPC): ISimpleItem|undefined {
    if (npc.noCorpseDrop) return undefined;

    const baseCorpse = this.game.itemCreator.getSimpleItem('Corpse');
    baseCorpse.mods.desc = `the corpse of a ${npc.name}`;
    baseCorpse.mods.sprite = npc.sprite + 4;

    return baseCorpse;
  }

}
