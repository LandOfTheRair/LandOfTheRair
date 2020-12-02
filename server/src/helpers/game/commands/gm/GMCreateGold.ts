import { IMacroCommandArgs, IPlayer } from '../../../../interfaces';
import { MacroCommand } from '../../../../models/macro';

export class GMCreateGold extends MacroCommand {

  aliases = ['@gold'];
  isGMCommand = true;
  canBeInstant = false;
  canBeFast = false;

  execute(player: IPlayer, args: IMacroCommandArgs) {
    const gold = this.game.itemCreator.getSimpleItem('Gold Coin');
    const value = +args.arrayArgs[0];
    if (!value) {
      this.sendMessage(player, `Enter an amount of gold.`);
      return;
    } else {
      gold.mods.value = value;
      this.game.worldManager.getMap(player.map).state.addItemToGround(player.x, player.y, gold);
      this.sendMessage(player, `${value} gold added to ground.`);
    }
  }
}
