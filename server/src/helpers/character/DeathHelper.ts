
import { Injectable } from 'injection-js';

import { BaseService, Currency, Direction, ICharacter, INPC, IPlayer, ISimpleItem } from '../../interfaces';
import { Player } from '../../models';

@Injectable()
export class DeathHelper extends BaseService {

  public init() {}

  // reviving functions
  public restore(player: IPlayer): void {

  }

  // dying functions
  public die(dead: ICharacter, killer?: ICharacter): void {
    if (!this.game.characterHelper.isDead(dead)) return;
    if (dead.hp.current === -1) return;

    dead.hp.current = -1;

    this.game.effectHelper.resetEffects(dead);
    dead.dir = Direction.Corpse;

    const corpse = this.createCorpse(dead);

    if (this.game.characterHelper.isPlayer(dead)) {
      this.playerDie(dead as IPlayer, corpse as ISimpleItem, killer);
    } else {
      this.npcDie(dead as INPC, corpse, killer);
    }
  }

  // mark last death location, add dead effect, clear action queue, check low con, drop hands if npc killed me
  private playerDie(dead: IPlayer, corpse: ISimpleItem, killer?: ICharacter): void {
    this.game.playerHelper.clearActionQueue(dead as Player);
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
        const gold = this.game.itemCreator.getSimpleItem('Gold Coin');
        gold.mods.value = goldHeld;
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
    // if dead is an npc
        // gain xp
        // gain skill
        // modify rep
  }

  // try to strip, try to eat
  private npcKill(killer: INPC, dead: ICharacter): void {
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
    // TODO: corpses need to be treated just like items. player corpse cameras should maybe not move until they're resurrected (their ghost is stuck, maybe)
    // TODO: track player corpses globally, and poof them if player logs out and back in
    // TODO: if a player logs out and their corpse is revived, remove it with "there is no spirit to inhabit this body"

    return baseCorpse;
  }

  // create npc corpse
  private createNPCCorpse(npc: INPC): ISimpleItem|undefined {
    if (npc.noCorpseDrop) return undefined;

    const baseCorpse = this.game.itemCreator.getSimpleItem('Corpse');
    baseCorpse.mods.desc = `the corpse of a ${npc}`;

    return baseCorpse;
  }

}
