
import { Injectable } from 'injection-js';
import { get, set } from 'lodash';

import { Allegiance, BaseService, ICharacter, INPC, INPCDefinition } from '../../interfaces';
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

  public registerAttackDamage(npc: INPC, char: ICharacter, attack: string, damage: number) {
    npc.targetDamageDone = npc.targetDamageDone || {};
    set(npc, ['targetDamageDone', char.uuid, attack, 'lastDamage'], damage);

    this.registerZeroTimes(npc, char, attack, damage > 0);
  }

  public getAttackDamage(npc: INPC, char: ICharacter, attack: string) {
    return get(npc, ['targetDamageDone', char.uuid, attack, 'lastDamage'], -1);
  }

  public registerZeroTimes(npc: INPC, char: ICharacter, attack: string, overrideValue?: boolean) {
    npc.targetDamageDone = npc.targetDamageDone || {};
    const times = get(npc, ['targetDamageDone', char.uuid, attack, 'zeroTimes'], 0);
    set(npc, ['targetDamageDone', char.uuid, attack, 'zeroTimes'], overrideValue ? 0 : times + 1);
  }

  public getZeroTimes(npc: INPC, char: ICharacter, attack: string) {
    npc.targetDamageDone = npc.targetDamageDone || {};
    return get(npc, ['targetDamageDone', char.uuid, attack, 'zeroTimes'], 0);
  }

}
