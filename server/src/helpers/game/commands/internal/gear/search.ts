
import { IMacroCommandArgs, IPlayer, ItemClass, ObjectType } from '../../../../../interfaces';
import { Player } from '../../../../../models';
import { LookCommand } from './look';

export class SearchCommand extends LookCommand {

  override aliases = ['search'];
  override canBeFast = true;

  override execute(player: IPlayer, args: IMacroCommandArgs) {

    const mapData = this.game.worldManager.getMap(player.map);
    if (!mapData) return;

    const corpses = mapData.state.getItemsFromGround(player.x, player.y, ItemClass.Corpse) || [];

    const uuids = corpses.filter(x => (x.item.mods?.searchItems?.length ?? 0) > 0).map(x => x.item.uuid);
    if (uuids.length > 0) {
      this.game.corpseManager.searchCorpses(uuids);
    }

    const chest = mapData.map.getInteractableOfTypeAt(player.x, player.y, ObjectType.TreasureChest);
    if (chest) {
      this.game.interactionHelper.openChest(player, chest);
    }

    super.execute(player, args);

    const gold = mapData.state.getItemsFromGround(player.x, player.y, ItemClass.Coin) || [];
    if (gold.length > 0) {
      this.game.commandHandler.doCommand(player as Player, { command: '~GtS', args: 'Coin' }, args.callbacks);
      this.sendChatMessage(player, `You looted ${(gold[0].item.mods.value ?? 0).toLocaleString()} gold.`);
    }

  }

}
