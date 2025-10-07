import { isPlayer } from '@lotr/characters';
import type { ICharacter } from '@lotr/interfaces';
import { ItemClass } from '@lotr/interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class SetTrap extends SpellCommand {
  override aliases = ['settrap'];
  override requiresLearn = true;

  override canUse(caster: ICharacter): boolean {
    return !!caster.items.sack.items.find((x) => {
      const itemClass = this.game.itemHelper.getItemProperty(x, 'itemClass');
      return itemClass === ItemClass.Trap;
    });
  }

  override mpCost(): number {
    return 0;
  }

  override use(executor: ICharacter) {
    if (isPlayer(executor)) return;

    const trap = executor.items.sack.items.find((x) => {
      const itemClass = this.game.itemHelper.getItemProperty(x, 'itemClass');
      return itemClass === ItemClass.Trap;
    });

    if (!trap) return;

    this.game.trapHelper.placeTrap(executor.x, executor.y, executor, trap);

    this.game.inventoryHelper.removeItemsFromSackByUUID(executor, [trap.uuid]);
  }
}
