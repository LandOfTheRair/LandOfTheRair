
import { ICharacter, ItemClass } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class SetTrap extends SpellCommand {

  override aliases = ['settrap'];
  override requiresLearn = true;

  override canUse(caster: ICharacter): boolean {
    return !!caster.items.sack.items.find(x => {
      const itemClass = this.game.itemHelper.getItemProperty(x, 'itemClass');
      return itemClass === ItemClass.Trap;
    });
  }

  override use(executor: ICharacter) {
    if (this.game.characterHelper.isPlayer(executor)) return;

    const trap = executor.items.sack.items.find(x => {
      const itemClass = this.game.itemHelper.getItemProperty(x, 'itemClass');
      return itemClass === ItemClass.Trap;
    });

    if (!trap) return;

    this.game.trapHelper.placeTrap(executor.x, executor.y, executor, trap);

    this.game.inventoryHelper.removeItemsFromSackByUUID(executor, [trap.uuid]);
  }
}
