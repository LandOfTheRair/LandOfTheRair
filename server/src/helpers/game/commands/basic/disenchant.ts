import { IMacroCommandArgs, IPlayer, ItemSlot, SoundEffect } from '../../../../interfaces';
import { MacroCommand } from '../../../../models/macro';

export class Disenchant extends MacroCommand {

  override aliases = ['disenchant'];
  override canBeInstant = false;
  override canBeFast = false;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    const item = player.items.equipment[ItemSlot.RightHand];
    if (!item) return this.sendMessage(player, 'You are not holding an item there!');
    if (!this.game.itemHelper.isOwnedBy(player, item)) return this.sendMessage(player, 'That item is not yours to disenchant!');

    const quality = this.game.itemHelper.getItemProperty(item, 'quality') ?? 0;
    if (quality < 1) return this.sendMessage(player, 'That item has no magical powers!');

    const enosDust = this.game.itemCreator.getSimpleItem('Enchanting Dust - Enos');
    enosDust.mods.ounces = quality;

    this.game.characterHelper.setEquipmentSlot(player, ItemSlot.RightHand, enosDust);

    this.sendMessage(player, `You disenchant the item in your right hand and get ${quality} dust!`, SoundEffect.CombatBlockArmor);
  }
}
