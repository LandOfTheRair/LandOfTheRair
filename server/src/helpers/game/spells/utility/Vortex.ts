import { ICharacter, IGroundItem, ISimpleItem, SpellCastArgs } from '../../../../interfaces';
import { Spell } from '../../../../models/world/Spell';

export class Vortex extends Spell {

  override cast(caster: ICharacter | null, target: ICharacter | null, spellCastArgs: SpellCastArgs): void {
    if (!caster) return;

    const map = this.game.worldManager.getMapStateForCharacter(caster);

    const addItems: ISimpleItem[] = [];

    const radius = 1;
    for (let x = caster.x - radius; x <= caster.x + radius; x++) {
      for (let y = caster.y - radius; y <= caster.y + radius; y++) {
        if (x === caster.x && y === caster.y) continue;

        const groundHere = map.getEntireGround(x, y);
        const removeItems: IGroundItem[] = [];

        Object.keys(groundHere).forEach(itemClass => {
          groundHere[itemClass].forEach(item => {
            removeItems.push(item);
            addItems.push(...Array(item.count || 1).fill(null).map(() => item.item));
          });
        });


        map.removeItemsFromGround(x, y, removeItems);
      }
    }

    map.addItemsToGround(caster.x, caster.y, addItems);
  }

}
