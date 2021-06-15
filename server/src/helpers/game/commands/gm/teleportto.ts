import { ICharacter, IMacroCommandArgs, IPlayer } from '../../../../interfaces';
import { Player } from '../../../../models';
import { MacroCommand } from '../../../../models/macro';

export class GMTeleportTo extends MacroCommand {

  override aliases = ['@teleportto', '@tt'];
  override isGMCommand = true;
  override canBeInstant = false;
  override canBeFast = false;

  override execute(player: IPlayer, args: IMacroCommandArgs) {

    const search = args.stringArgs;

    let target: ICharacter | undefined;

    this.game.worldManager.allMapNames.forEach(map => {
      const mapData = this.game.worldManager.getMap(map);
      if (!mapData) return;

      mapData.state.allNPCS.forEach(npc => {
        if (!this.game.targettingHelper.doesTargetMatchSearch(npc, search, true)) return;

        target = npc;
      });
    });

    if (!target) return this.sendChatMessage(player, 'There was no matching target.');

    this.sendMessage(player, 'Woosh.');

    this.game.teleportHelper.teleport(player as Player, { x: target.x, y: target.y, map: target.map });
  }
}
