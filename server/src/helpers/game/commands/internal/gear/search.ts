
import { IMacroCommandArgs, IPlayer, ItemClass } from '../../../../../interfaces';
import { LookCommand } from './look';

export class SearchCommand extends LookCommand {

  aliases = ['search'];
  canBeFast = true;

  execute(player: IPlayer, args: IMacroCommandArgs) {

    const { state } = this.game.worldManager.getMap(player.map);
    const corpses = state.getItemsFromGround(player.x, player.y, ItemClass.Corpse) || [];

    const uuids = corpses.filter(x => (x.item.mods?.searchItems?.length ?? 0) > 0).map(x => x.item.uuid);
    if (uuids.length > 0) {
      this.game.corpseManager.searchCorpses(uuids);
    }

    super.execute(player, args);

  }

}
