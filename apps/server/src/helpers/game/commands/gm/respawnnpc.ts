import { MacroCommand, worldGetMapAndState } from '@lotr/core';
import type { IMacroCommandArgs, IPlayer } from '@lotr/interfaces';

export class GMRespawnNPC extends MacroCommand {
  override aliases = ['@respawn'];
  override isGMCommand = true;
  override canBeInstant = false;
  override canBeFast = false;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    const respawnish = args.stringArgs;

    const mapState = worldGetMapAndState(player.map)?.state;
    if (!mapState) return;

    let didRespawn = false;

    const spawners = mapState.allSpawners;
    spawners.forEach((s) => {
      const npcs = s.allPossibleNPCSpawns.filter((f: any) =>
        f.name?.toLowerCase().includes(respawnish),
      );
      if (npcs.length === 0) return;

      didRespawn = true;

      npcs.forEach((n) => {
        const activeNPC = s.allNPCS.find(
          (sn) => sn.name === (n as any).name && sn.hp.current > 0,
        );

        if (activeNPC) {
          this.sendMessage(
            player,
            `Could not respawn NPC at ${n.x},${n.y} - it isn't dead.`,
          );
          return;
        }

        this.sendMessage(player, `Force-respawning NPC at ${n.x},${n.y}.`);

        s.forceSpawnNPC({
          npcDef: n,
        });
      });
    });

    if (!didRespawn) {
      this.sendMessage(player, `Could not find any NPCs to respawn.`);
    }
  }
}
