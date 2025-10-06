import type { ICharacter, IMapScript, INPC } from '@lotr/interfaces';
import { ItemSlot } from '@lotr/interfaces';

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { Game } from '../../../helpers';

export class RisanMinesScript implements IMapScript {
  readonly name = 'RisanMines';

  private ventCooldowns: Record<string, number> = {};

  setup() {}

  events() {}

  handleEvent(game: Game, event: string, { trigger }) {
    if (event === 'on:crazedmist') {
      if (this.ventCooldowns[trigger.x + ' ' + trigger.y] > Date.now()) return;

      this.ventCooldowns[trigger.x + ' ' + trigger.y] = Date.now() + 5000;

      game.messageHelper.sendSimpleMessage(trigger, 'You feel a rush of heat!');

      game.commandHandler.getSkillRef('FireMist').use(
        trigger,
        trigger,
        {
          overrideEffect: { range: 1, name: 'FireMist', potency: 350 },
        },
        { x: trigger.x, y: trigger.y, map: trigger.map },
      );

      game.worldManager
        .getMap('RisanMines')
        ?.state.getAllInRange(trigger, 1, [], false)
        .forEach((creature) => {
          this.applyDebuff(game, creature);

          if ((creature as INPC).npcId === 'Risan Miner') {
            this.transformMiner(game, creature as INPC);
          }
        });
    }
  }

  private applyDebuff(game: Game, char: ICharacter) {
    game.effectHelper.addEffect(char, '', 'MinerFever');
  }

  private transformMiner(game: Game, npc: INPC) {
    game.deathHelper.fakeNPCDie(npc);
    game.worldManager
      .getMap('RisanMines')
      ?.state.getNPCSpawner(npc.uuid)
      ?.forceSpawnNPC({
        npcId: 'Risan Crazed Miner',
        spawnLoc: { x: npc.x, y: npc.y },
        createCallback: (spawned) => {
          spawned.items.equipment[ItemSlot.LeftHand] =
            npc.items.equipment[ItemSlot.LeftHand];
          spawned.items.equipment[ItemSlot.RightHand] =
            npc.items.equipment[ItemSlot.RightHand];
        },
      });
  }
}
