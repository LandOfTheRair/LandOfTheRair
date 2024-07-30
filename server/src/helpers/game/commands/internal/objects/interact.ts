import { IMacroCommandArgs } from '../../../../../interfaces';
import { MapState, Player } from '../../../../../models';
import { MacroCommand } from '../../../../../models/macro';

export class Interact extends MacroCommand {

  override aliases = ['interact'];
  override canBeFast = true;
  override canBeInstant = true;

  override execute(player: Player, args: IMacroCommandArgs) {
    const [x, y] = args.arrayArgs.map(v => +v);
    if (Math.abs(x) > 1 || Math.abs(y) > 1) return;

    const mapData = this.game.worldManager.getMap(player.map);
    if (!mapData) return;

    const interactable = mapData.map.getInteractableAt(player.x + x, player.y + y);
    if (!interactable) return;

    let cmdInfo = {};
    switch (interactable.type) {
      case 'Door': cmdInfo = this.doDoor(interactable, mapData.state); break;
    }

    const { command, shouldContinue, errorMessage }: any = cmdInfo;
    const sendArgs = `${x} ${y}`;
    if (!command || !shouldContinue) {
      if (errorMessage) this.sendMessage(player, errorMessage);
      return;
    }

    this.game.commandHandler.doCommand(player, { command, args: sendArgs }, args.callbacks);
  }

  private doDoor(door, state: MapState) {
    const isOpen = state.isDoorOpen(door.id);
    return { command: 'open', shouldContinue: !isOpen };
  }

}
