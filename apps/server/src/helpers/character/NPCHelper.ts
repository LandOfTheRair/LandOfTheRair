import { Injectable } from 'injection-js';
import { get, set } from 'lodash';

import { npcAllGet, npcGet } from '@lotr/content';
import type { ICharacter, INPC, INPCDefinition } from '@lotr/interfaces';
import { Allegiance } from '@lotr/interfaces';
import { BaseService } from '../../models/BaseService';

// functions related to MODIFYING an NPC
// not to be confused with NPCCreator which is for HELPER FUNCTIONS that CREATE NPCs

@Injectable()
export class NPCHelper extends BaseService {
  public init() {}

  // get the real npc definition for a named npc id
  public getNPCDefinition(npcId: string): INPCDefinition {
    return npcGet(npcId)!;
  }

  public isNaturalResource(npc: INPC): boolean {
    return npc.allegiance === Allegiance.NaturalResource;
  }

  public tick(npc: INPC, tick: number): void {
    if (this.isNaturalResource(npc)) return;

    this.game.characterHelper.tick(npc, tick);
  }

  public registerAttackDamage(
    npc: INPC,
    char: ICharacter,
    attack: string,
    damage: number,
  ) {
    npc.targetDamageDone = npc.targetDamageDone || {};
    set(npc, ['targetDamageDone', char.uuid, attack, 'lastDamage'], damage);

    this.registerZeroTimes(npc, char, attack, damage > 0);
  }

  public getAttackDamage(npc: INPC, char: ICharacter, attack: string) {
    return get(npc, ['targetDamageDone', char.uuid, attack, 'lastDamage'], -1);
  }

  public registerZeroTimes(
    npc: INPC,
    char: ICharacter,
    attack: string,
    overrideValue?: boolean,
  ) {
    npc.targetDamageDone = npc.targetDamageDone || {};
    const times = get(
      npc,
      ['targetDamageDone', char.uuid, attack, 'zeroTimes'],
      0,
    );
    set(
      npc,
      ['targetDamageDone', char.uuid, attack, 'zeroTimes'],
      overrideValue ? 0 : times + 1,
    );
  }

  public getZeroTimes(npc: INPC, char: ICharacter, attack: string) {
    npc.targetDamageDone = npc.targetDamageDone || {};
    return get(npc, ['targetDamageDone', char.uuid, attack, 'zeroTimes'], 0);
  }

  // search all npcs for similar things
  public searchNPCs(search: string): string[] {
    return Object.keys(npcAllGet()).filter((x) =>
      new RegExp(`.*${search}.*`, 'i').test(x),
    );
  }
}
