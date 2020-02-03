
import { Injectable } from 'injection-js';

import { Allegiance, BaseService, ICharacter, initializeCharacter, INPCDefinition, ISimpleNPC, MonsterClass } from '../../interfaces';
import { ContentManager } from '../data';

import { species } from 'fantastical';

@Injectable()
export class NPCHelper extends BaseService {

  constructor(
    private content: ContentManager
  ) {
    super();
  }

  public init() {}

  // get an item that can be equipped
  public getSimpleNPC(npcId: string): ISimpleNPC {
    return { npcId, mods: {} };
  }

  // get the real item for base information lookup
  public getNPC(npcId: string): INPCDefinition {
    return this.content.npcs[npcId];
  }

  public getNPCName(npc: INPCDefinition): string {
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
