import { Inject, Singleton } from 'typescript-ioc';

import { Allegiance, BaseService, ICharacter, initializeCharacter, INPC, ISimpleNPC, MonsterClass } from '../../interfaces';
import { ContentManager } from '../data';

import { species } from 'fantastical';

@Singleton
export class NPCHelper extends BaseService {

  @Inject private content: ContentManager;

  public init() {}

  // get an item that can be equipped
  public getSimpleNPC(npcId: string): ISimpleNPC {
    return { npcId, mods: {} };
  }

  // get the real item for base information lookup
  public getNPC(npcId: string): INPC {
    return this.content.npcs[npcId];
  }

  public getNPCName(npc: INPC): string {
    if (npc.name) return npc.name;

    switch (npc.monsterClass) {
      case MonsterClass.Dragon:    return species.dragon();
      case MonsterClass.Beast:     return species.ogre();
      case MonsterClass.Undead:    return species.human();
    }

    switch (npc.allegiance) {
      case Allegiance.Pirates:     return species.dwarf();
      case Allegiance.Royalty:     return species.highelf();
      case Allegiance.Townsfolk:   return species.human();
      case Allegiance.Underground: return species.cavePerson();
      case Allegiance.Wilderness:  return species.fairy();
      case Allegiance.Adventurers: return species.gnome();
    }

    return species.human();
  }

  // actually make a character from an npc id
  public createCharacterFromNPC(npcId: string): ICharacter {
    const baseChar = initializeCharacter({});

    const npc = this.getNPC(npcId);
    baseChar.name = this.getNPCName(npc);

    // TODO: more props

    return baseChar;
  }
}
