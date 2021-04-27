import { IMacroCommandArgs, IPlayer, ItemSlot } from '../../../../interfaces';
import { MacroCommand } from '../../../../models/macro';

export class GMUpgradeItem extends MacroCommand {

  override aliases = ['@upgradeitem', '@ui'];
  override isGMCommand = true;
  override canBeInstant = false;
  override canBeFast = false;

  override execute(player: IPlayer, args: IMacroCommandArgs) {

    const rightHand = player.items.equipment[ItemSlot.RightHand];
    if (!rightHand) return this.sendMessage(player, 'You need to hold something to upgrade in your right hand.');

    const leftHand = player.items.equipment[ItemSlot.LeftHand];
    if (!leftHand) return this.sendMessage(player, 'You need to hold something to upgrade with your left hand.');

    this.game.itemHelper.upgradeItem(rightHand, leftHand.name, true);
    this.game.characterHelper.setLeftHand(player, undefined);

    this.sendMessage(player, `Upgraded ${rightHand.name} with one ${leftHand.name}. ${rightHand.name}
      now has ${rightHand.mods.upgrades?.length ?? 0} upgrade(s) (base max: ${rightHand.mods.maxUpgrades ?? 0}).`);
  }
}
