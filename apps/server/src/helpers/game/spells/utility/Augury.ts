import { worldGetMapAndState } from '@lotr/core';
import type { ICharacter, INPC, SpellCastArgs } from '@lotr/interfaces';
import { distanceFrom } from '@lotr/shared';
import { Spell } from '../../../../models/world/Spell';

export class Augury extends Spell {
  override cast(
    caster: ICharacter | undefined,
    target: ICharacter | undefined,
    spellCastArgs: SpellCastArgs,
  ): void {
    if (!caster) return;

    const targetName = spellCastArgs.originalArgs?.stringArgs;
    if (!targetName) {
      return this.sendMessage(caster, {
        message: 'The birds fly around, confused at your query.',
      });
    }

    const mapState = worldGetMapAndState(caster.map);
    if (!mapState) return;

    const targets: INPC[] = [];
    this.game.worldManager.allMapNames.forEach((checkMap) => {
      const mapData = worldGetMapAndState(checkMap);
      if (!mapData) return;

      mapData.state?.allNPCS.forEach((npc) => {
        if (
          !this.game.targettingHelper.doesTargetMatchSearch(
            npc,
            targetName,
            true,
          )
        ) {
          return;
        }

        targets.push(npc);
      });
    });

    if (targets.length > 1) {
      return this.sendMessage(caster, {
        message: 'The birds point in multiple directions simultaneously.',
      });
    }

    const foundNPC = targets[0];
    if (!foundNPC) {
      return this.sendMessage(caster, {
        message: 'The birds fly around, confused at your query.',
      });
    }

    if (foundNPC.map !== caster.map) {
      return this.sendMessage(caster, {
        message: 'The birds fly off to distant lands.',
      });
    }

    const map = worldGetMapAndState(caster.map)?.map;
    if (!map) return;

    const dist = distanceFrom(caster, foundNPC);

    const toZ = map.getZLevelAt(caster.x, caster.y);
    const fromZ = map.getZLevelAt(foundNPC.x, foundNPC.y);

    let distance = `${this.distanceToMeasurement(dist)}`;
    if (toZ < fromZ) distance = 'above you';
    if (toZ > fromZ) distance = 'below you';

    let baseString = `The birds have found a creature called ${foundNPC.name}.`;
    baseString = `${baseString} ${foundNPC.name} is ${distance}.`;
    baseString = `${baseString} ${foundNPC.name} ${this.healthToMeasurement(target)}.`;

    this.sendMessage(caster, { message: baseString });
  }

  private distanceToMeasurement(dist: number): string {
    if (dist <= 0) return 'on top of you';
    if (dist < 5) return 'very close to you';
    if (dist < 10) return 'nearby';
    if (dist < 50) return 'a fair distance away from you';
    return 'very far away from you';
  }

  private healthToMeasurement(target): string {
    if (target.hp.current <= 0) return 'has passed from this world';
    if (target.hp.current === target.hp.maximum) return 'is unscathed';
    if (target.hp.current <= target.hp.maximum * 0.05) {
      return 'is in critical condition';
    }
    if (target.hp.current <= target.hp.maximum * 0.25) {
      return 'is nearing death';
    }
    if (target.hp.current <= target.hp.maximum * 0.5) {
      return 'has taken some damage';
    }
    if (target.hp.current <= target.hp.maximum * 0.75) return 'is in pain';
    return 'looks a bit ruffled up';
  }
}
