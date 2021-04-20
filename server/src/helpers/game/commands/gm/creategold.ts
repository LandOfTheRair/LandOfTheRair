import { IMacroCommandArgs, IPlayer, ItemSlot } from '../../../../interfaces';
import { MacroCommand } from '../../../../models/macro';

export class GMCreateGold extends MacroCommand {

  override aliases = ['@gold'];
  override isGMCommand = true;
  override canBeInstant = false;
  override canBeFast = false;

  override execute(player: IPlayer, args: IMacroCommandArgs) {

    const value = this.game.userInputHelper.cleanNumber(args.arrayArgs[0], 0, { floor: true, abs: true });
    if (!value) {
      this.sendMessage(player, 'Enter a valid amount of gold.');
      return;
    }

    const gold = this.game.itemCreator.getGold(value);
    if (!player.items.equipment[ItemSlot.RightHand]) {
      this.game.characterHelper.setRightHand(player, gold);
      this.sendMessage(player, `${value} gold added to your right hand.`);
    } else {
      this.game.worldManager.getMap(player.map)?.state.addItemToGround(player.x, player.y, gold);
      this.sendMessage(player, `${value} gold added to ground.`);
    }
  }
}
