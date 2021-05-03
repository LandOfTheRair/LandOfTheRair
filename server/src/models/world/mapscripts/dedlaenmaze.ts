import { Game } from '../../../helpers';
import { IMapScript } from '../../../interfaces';

export class DedlaenMazeScript implements IMapScript {
  readonly name = 'DedlaenMaze';

  setup() {

  }

  events() {

  }

  handleEvent(game: Game, event: string, { trigger }) {
    if (event === 'on:swwalltile') {
      game.messageHelper.sendSimpleMessage(trigger, 'You hear a clicking noise.');
      this.toggleDoors(game, true);
    }

    if (event === 'off:swwalltile') {
      this.toggleDoors(game, false);
    }
  }

  private toggleDoors(game: Game, open: boolean) {
    const mapRef = game.worldManager.getMap('DedlaenMaze');

    for (let i = 1; i <= 3; i++) {
      const door = mapRef?.map.findInteractableByName(`Tile Door ${i}`);
      if (open) mapRef?.state.openDoor(door.id);
      else      mapRef?.state.closeDoor(door.id);
    }
  }

}
