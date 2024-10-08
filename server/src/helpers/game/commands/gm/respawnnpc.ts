import { IMacroCommandArgs, IPlayer } from '../../../../interfaces';
import { MacroCommand } from '../../../../models/macro';

export class GMRespawnNPC extends MacroCommand {
  override aliases = ['@respawn'];
  override isGMCommand = true;
  override canBeInstant = false;
  override canBeFast = false;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    const respawnish = args.stringArgs;

    const mapState = this.game.worldManager.getMap(player.map)?.state;
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
