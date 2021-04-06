import { ICharacter, SpellCastArgs } from '../../../../interfaces';
import { Spell } from '../../../../models/world/Spell';

export class Augury extends Spell {

  override cast(caster: ICharacter | null, target: ICharacter | null, spellCastArgs: SpellCastArgs): void {
    if (!caster) return;

    const targetName = spellCastArgs.originalArgs?.stringArgs;
    if (!targetName) return this.sendMessage(caster, { message: 'The birds fly around, confused at your query.' });

    const mapState = this.game.worldManager.getMapStateForCharacter(caster);

    const matchingNPCs = mapState.allNPCS.filter(x => x.name.toLowerCase().includes(targetName.toLowerCase()));
    if (matchingNPCs.length > 1) {
      return this.sendMessage(caster, { message: 'The birds point in multiple directions simultaneously.' });
    }

    const foundNPC = matchingNPCs[0];
    if (!foundNPC) {
      return this.sendMessage(caster, { message: 'The birds fly around, confused at your query. '});
    }

    const dist = this.game.directionHelper.distFrom(caster, foundNPC);

    let baseString = `The birds have found a creature called ${foundNPC.name}.`;
    baseString = `${baseString} ${foundNPC.name} is ${this.distanceToMeasurement(dist)}.`;
    baseString = `${baseString} ${foundNPC.name} ${this.healthToMeasurement(target)}.`;

    this.sendMessage(caster, { message: baseString });
  }

  private distanceToMeasurement(dist: number): string {
    if (dist <= 0) return 'on top of you';
    if (dist <  5) return 'very close to you';
    if (dist < 10) return 'nearby';
    if (dist < 50) return 'a fair distance away from you';
    return 'very far away from you';
  }

  private healthToMeasurement(target): string {
    if (target.hp.current <= 0)                         return 'has passed from this world';
    if (target.hp.current === target.hp.maximum)        return 'is unscathed';
    if (target.hp.current <= target.hp.maximum * 0.05)  return 'is in critical condition';
    if (target.hp.current <= target.hp.maximum * 0.25)  return 'is nearing death';
    if (target.hp.current <= target.hp.maximum * 0.50)  return 'has taken some damage';
    if (target.hp.current <= target.hp.maximum * 0.75)  return 'is in pain';
    return 'looks a bit ruffled up';
  }

}
