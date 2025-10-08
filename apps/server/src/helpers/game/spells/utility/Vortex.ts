import { settingGameGet, traitLevelValue } from '@lotr/content';
import type {
  ICharacter,
  IGroundItem,
  ISimpleItem,
  SpellCastArgs,
} from '@lotr/interfaces';
import { Spell } from '../../../../models/world/Spell';

export class Vortex extends Spell {
  override cast(
    caster: ICharacter | undefined,
    target: ICharacter | undefined,
    spellCastArgs: SpellCastArgs,
  ): void {
    if (!caster) return;

    const map = this.game.worldManager.getMapStateForCharacter(caster);
    if (!map) return;

    const addItems: ISimpleItem[] = [];

    const maxItems = settingGameGet('character', 'vortexMaxItems') ?? 50;

    const radius = 1 + traitLevelValue(caster, 'VortexWiden');
    for (let x = caster.x - radius; x <= caster.x + radius; x++) {
      for (let y = caster.y - radius; y <= caster.y + radius; y++) {
        if (addItems.length > maxItems) break;

        if (x === caster.x && y === caster.y) continue;

        const groundHere = map.getEntireGround(x, y);
        const removeItems: IGroundItem[] = [];

        Object.keys(groundHere).forEach((itemClass) => {
          groundHere[itemClass].forEach((item) => {
            if (addItems.length > maxItems) return;

            removeItems.push(item);
            addItems.push(
              ...Array(item.count || 1)
                .fill(null)
                .map(() => item.item),
            );
          });
        });

        map.removeItemsFromGround(x, y, removeItems);
      }
    }

    map.addItemsToGround(caster.x, caster.y, addItems);
  }
}
