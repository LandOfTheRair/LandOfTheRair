import { IMacroCommandArgs, IPlayer, ItemClass, ItemSlot } from '../../../../interfaces';
import { MacroCommand } from '../../../../models/macro';

export class NextPage extends MacroCommand {

  override aliases = ['nextpage'];
  override canBeInstant = false;

  override execute(player: IPlayer, args: IMacroCommandArgs) {

    const book = player.items.equipment[args.stringArgs];
    if (!book) return this.sendMessage(player, 'You do not have anything in that hand!');

    const { itemClass, bookCurrentPage, bookPages } = this.game.itemHelper.getItemProperties(book,
      ['itemClass', 'bookCurrentPage', 'bookPages']
    );
    if (itemClass !== ItemClass.Book) return this.sendMessage(player, 'You are not holding a book!');

    let currentPage = (bookCurrentPage ?? 0) + 1;
    if (currentPage > (bookPages ?? []).length - 1) currentPage = 0;

    book.mods.bookCurrentPage = currentPage;
    this.game.itemHelper.useBook(player, book, args.stringArgs as ItemSlot);
  }
}
