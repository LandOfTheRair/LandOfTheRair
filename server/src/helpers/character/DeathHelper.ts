
import { Injectable } from 'injection-js';
import { random } from 'lodash';

import { basePlayerSprite, BaseService, Currency, Direction, Hostility, ICharacter, INPC, IPlayer, ISimpleItem, ItemClass, Stat } from '../../interfaces';
import { Player } from '../../models';

@Injectable()
export class DeathHelper extends BaseService {

  public init() {}

  // revive the player from their death
  public restore(player: IPlayer, { x, y, map, shouldRot }: { x?: number, y?: number, map?: string, shouldRot?: boolean } = {}): void {

    // store old pos to look up corpse
    const oldX = player.x;
    const oldY = player.y;
    const oldMap = player.map;

    // we're being revived
    if (x && y && map) {
      this.game.teleportHelper.teleport(player as Player, { x, y, map });

    // tele to respawn point, then reset some vars
    } else {
      this.game.teleportHelper.teleportToRespawnPoint(player as Player);
    }

    player.hp.current = 1;
    player.dir = Direction.South;

    this.game.effectHelper.removeEffectByName(player, 'Dead');

    this.game.characterHelper.tryToCastEquipmentEffects(player);

    // remove our corpse if we have one
    if (player.corpseRef) {
      const { state } = this.game.worldManager.getMap(oldMap);
      state.removeItemFromGround(oldX, oldY, ItemClass.Corpse, player.corpseRef.uuid);

      this.game.corpseManager.removeCorpseFromAnyonesHands(player.corpseRef.uuid);
      delete player.corpseRef;
    }

    // if we rotted... deal with that
    if (shouldRot) {
      this.game.messageHelper.sendLogMessageToPlayer(player, { message: 'You feel a churning sensation...' });

      if ((player.stats?.[Stat.STR] ?? 0) > 5 && this.game.diceRollerHelper.OneInX(5)) {
        this.game.characterHelper.losePermanentStat(player, Stat.STR, 1);
      }

      if ((player.stats?.[Stat.AGI] ?? 0) > 5 && this.game.diceRollerHelper.OneInX(5)) {
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
    dead.dir = Direction.Corpse;
    dead.combatTicks = 0;

    const corpse = this.createCorpse(dead);

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

    dead.lastDeathLocation = { map: dead.map, x: dead.x, y: dead.y };

    if (corpse) {
      this.game.effectHelper.addEffect(dead, killer?.name ?? '', 'Dead', { effect: { duration: 500 } });
      dead.dir = Direction.Corpse;
      dead.corpseRef = corpse;

      const { state } = this.game.worldManager.getMap(dead.map);
      state.addItemToGround(dead.x, dead.y, corpse);

    } else {

      this.game.teleportHelper.teleportToRespawnPoint(dead as Player);
      this.restore(dead);
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
  }

  // dispatch ai death, calculate loot drops
  // corpses are optional, since some enemies might not have any - in this case, drop loot on ground
  private npcDie(dead: INPC, corpse?: ISimpleItem, killer?: ICharacter): void {

    if (!dead.noItemDrop) {
      const { state } = this.game.worldManager.getMap(dead.map);

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

      // roll items for the npc specifically
      const rolledItems = this.game.lootHelper.getNPCLoot(dead);
      allItems.push(...rolledItems);

      // attach items to corpse and put that on the ground
      if (corpse) {
        corpse.mods.searchItems = allItems;
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
      this.npcKill(killer as INPC, dead);
    }
  }

  // clear action queue of the dead uuid
  private playerKill(killer: IPlayer, dead: ICharacter): void {
    this.game.playerHelper.clearActionQueue(killer as Player, dead.uuid);
    if (this.game.characterHelper.isPlayer(dead)) return;

    const npc: INPC = dead as INPC;

    if (this.game.playerHelper.canGainExpOnMap(killer)) {
      const earnedExp = random(npc.giveXp.min, npc.giveXp.max);
      this.game.playerHelper.gainExp(killer, earnedExp);
    }

    killer.flaggedSkills = killer.flaggedSkills.filter(x => this.game.playerHelper.canGainSkillOnMap(killer, x));
    this.game.playerHelper.gainCurrentSkills(killer, npc.skillOnKill);

    npc.allegianceMods.forEach(({ delta, allegiance }) => {
      this.game.playerHelper.modifyReputationForAllegiance(killer, allegiance, delta);
    });
  }

  // try to strip, try to eat
  private npcKill(killer: INPC, dead: ICharacter): void {

    console.log('npc kill', killer.name, dead.name);

    // clear the agro when something is killed by an npc
    this.game.characterHelper.clearAgro(killer, dead);
    this.game.characterHelper.clearAgro(dead, killer);

    console.log(killer.agro);

    // TODO: try to strip
    // TODO: try to eat
  }

  // corpse creating
  private createCorpse(character: ICharacter): ISimpleItem|undefined {
    if (this.game.characterHelper.isPlayer(character)) {
      return this.createPlayerCorpse(character as IPlayer);
    } else {
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
