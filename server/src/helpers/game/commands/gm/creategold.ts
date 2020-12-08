import { IMacroCommandArgs, IPlayer, ItemSlot } from '../../../../interfaces';
import { MacroCommand } from '../../../../models/macro';

export class GMCreateGold extends MacroCommand {

  aliases = ['@gold'];
  isGMCommand = true;
  canBeInstant = false;
  canBeFast = false;

  execute(player: IPlayer, args: IMacroCommandArgs) {
    const value = Math.round(Math.abs(+args.arrayArgs[0]));
    if (!value || isNaN(value) || !isFinite(value)) {
      this.sendMessage(player, `Enter an amount of gold.`);
      return;
    }

    const gold = this.game.itemCreator.getGold(value);
    if (!player.items.equipment[ItemSlot.RightHand]) {
      this.game.characterHelper.setRightHand(player, gold);
      this.sendMessage(player, `${value} gold added to your right hand.`);
    } else {
      this.game.worldManager.getMap(player.map).state.addItemToGround(player.x, player.y, gold);
      this.sendMessage(player, `${value} gold added to ground.`);
    }
  }
}
