import { getEmptyHand, hasEmptyHand } from '@lotr/characters';
import type { IMacroCommandArgs, IPlayer } from '@lotr/interfaces';
import { ItemClass, ItemSlot } from '@lotr/interfaces';
import { MacroCommand } from '../../../../../models/macro';

export class TradeCommand extends MacroCommand {
  override aliases = ['dotrade'];

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    const [hand, targetName] = args.arrayArgs;

    if (hand !== 'right' && hand !== 'left') {
      return this.sendMessage(player, 'Invalid hand.');
    }

    const slot = hand === 'right' ? ItemSlot.RightHand : ItemSlot.LeftHand;
    const item = player.items.equipment[slot];
    if (!item) return this.sendMessage(player, 'No item in that hand.');

    const invalidItemClasses: ItemClass[] = [ItemClass.Corpse];
    const { itemClass, succorInfo } = this.game.itemHelper.getItemProperties(
      item,
      ['itemClass', 'succorInfo'],
    );
    if (invalidItemClasses.includes(itemClass as ItemClass)) {
      return this.sendMessage(player, 'You cannot trade that item.');
    }

    if (succorInfo) {
      return this.sendMessage(player, 'You cannot trade that item.');
    }

    const target = this.game.targettingHelper.getFirstPossibleTargetInViewRange(
      player,
      targetName,
    );
    if (!target) return this.youDontSeeThatPerson(player, targetName);

    const hasEmpty = hasEmptyHand(target);
    if (!hasEmpty) {
      return this.sendMessage(
        player,
        'That person does not have an empty hand.',
      );
    }

    if (!player.isTradeEnabled) {
      return this.sendMessage(player, 'You are not trade enabled.');
    }

    if (!target.isTradeEnabled) {
      return this.sendMessage(player, 'They are not trade enabled.');
    }

    const emptyHand = getEmptyHand(target);
    if (!emptyHand) return this.sendMessage(player, 'Should not happen.');

    this.game.characterHelper.setEquipmentSlot(target, emptyHand, item);
    this.game.characterHelper.setEquipmentSlot(player, slot, undefined);

    this.sendMessage(player, 'Traded item successfully.');
    this.sendMessage(target, `${player.name} gave you something!`);
  }
}
