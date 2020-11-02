
import { Injectable } from 'injection-js';

import { Allegiance, BaseService, INPC, INPCDefinition } from '../../interfaces';
import { ContentManager } from '../data';
import { CharacterHelper } from './CharacterHelper';

// functions related to MODIFYING an NPC
// not to be confused with NPCCreator which is for HELPER FUNCTIONS that CREATE NPCs

@Injectable()
export class NPCHelper extends BaseService {

  constructor(
    private characterHelper: CharacterHelper,
    private content: ContentManager
  ) {
    super();
  }

  public init() {}

  // get the real npc definition for a named npc id
  public getNPCDefinition(npcId: string): INPCDefinition {
    return this.content.getNPCDefinition(npcId);
  }

  public isNaturalResource(npc: INPC): boolean {
    return npc.allegiance === Allegiance.NaturalResource;
  }

  public tick(npc: INPC): void {
    if (this.isNaturalResource(npc)) return;

    this.characterHelper.tick(npc);
  }

}
