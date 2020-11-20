
import { GameAction, IMacroCommandArgs, IPlayer, ItemClass } from '../../../../../interfaces';
import { MacroCommand } from '../../../../../models/macro';

export class LookCommand extends MacroCommand {

  aliases = ['look'];
  canBeFast = true;
  canUseWhileDead = true;

  private getStringForNum(num: number) {
    if (num === 1) return 'a';
    if (num <= 3)  return num;
    if (num <= 5)  return 'a handful of';
    if (num <= 7)  return 'a few';
    if (num <= 10) return 'some';
    if (num <= 20) return 'a pile of';
    if (num <= 50) return 'many';
    if (num <= 100) return 'a lot of';
    return 'zounds of';
  }

  execute(player: IPlayer, args: IMacroCommandArgs) {

    args.callbacks.emit({
      action: GameAction.SettingsShowWindow,
      windowName: 'ground'
    });

    args.callbacks.emit({
      action: GameAction.SettingsActiveWindow,
      windowName: 'ground'
    });

    const { state } = this.game.worldManager.getMap(player.map);
    const items = state.getEntireGround(player.x, player.y);

    const allTypes = Object.keys(items);

    // get type names
    const typesWithNames = allTypes.sort().map(itemType => {
      if (itemType === ItemClass.Coin && items[ItemClass.Coin][0]) {
        const coinItem = items[ItemClass.Coin][0].item;
        return `${coinItem.mods.value} ${coinItem.name.toLowerCase()}${(coinItem.mods.value ?? 0) > 1 ? 's' : ''}`;
      }

      // make sure we have items to check
      const len = items[itemType].length;
      if (len === 0) return '';

      // check if we should add an s to the end of the item
      const str = this.getStringForNum(len);
      const shouldS = !itemType.endsWith('s');

      // finalize the name
      return `${str} ${itemType.toLowerCase()}${len > 1 && shouldS ? 's' : ''}`;
    }).flat().filter(Boolean);

    if (typesWithNames.length === 0) {
      this.sendMessage(player, 'You see nothing of interest.');
      return;
    }

    if (typesWithNames.length > 1) {
      typesWithNames[typesWithNames.length - 1] = `and ${typesWithNames[typesWithNames.length - 1]}`;
    }

    this.sendMessage(player, `You see ${typesWithNames.join(', ')}.`);
  }

}
