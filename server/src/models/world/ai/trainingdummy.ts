import { ICharacter, IPlayer } from '../../../interfaces';
import { DefaultAIBehavior } from './default';

export class TrainingDummyAI extends DefaultAIBehavior {

  private lastAttackTick: Record<string, number> = {};
  private currentlyTicking: Record<string, number> = {};
  private tenSecDamageTotals: Record<string, number> = {};
  private runningDamageTotals: Record<string, number> = {};

  private reset(username) {
    delete this.lastAttackTick[username];
    delete this.currentlyTicking[username];
    delete this.runningDamageTotals[username];
    delete this.tenSecDamageTotals[username];
  }

  override tick(): void {}

  override mechanicTick(): void {

    // reset agro every tick
    this.resetAgro(true);

    Object.keys(this.currentlyTicking).forEach(username => {

      // no player? reset them, they left
      const player = this.game.playerManager.getPlayerByUsername(username);
      if (!player) {
        this.reset(username);
        return;
      }

      // lower the relative and absolute tick
      this.lastAttackTick[username]--;
      this.currentlyTicking[username]--;

      // every 10s give a report to the player
      if ((this.currentlyTicking[username] % 5) === 0) {
        const totalDamageForPeriod = this.tenSecDamageTotals[username] || 0;
        const dpsInPeriod = Math.floor(totalDamageForPeriod / 10);

        // reset the ten second total
        delete this.tenSecDamageTotals[username];

        if (totalDamageForPeriod === 0) {
          this.reset(username);
          return;
        }

        const tenS = `Dummy DPS Report: 10s: ${dpsInPeriod.toLocaleString()} DPS (total: ${totalDamageForPeriod.toLocaleString()})`;
        this.game.messageHelper.sendLogMessageToPlayer(player, { message: tenS });
      }

      if (this.currentlyTicking[username] <= 0) {

        const totalDamageForPeriod = this.runningDamageTotals[username];
        const dpsInPeriod = Math.floor(totalDamageForPeriod / 60);

        const sixtyS = `Dummy DPS Report: 60s: ${dpsInPeriod.toLocaleString()} DPS (total: ${totalDamageForPeriod.toLocaleString()})`;
        this.game.messageHelper.sendLogMessageToPlayer(player, { message: sixtyS });
        this.reset(username);
      }
    });
  }

  override damageTaken({ damage, attacker }: { damage: number; attacker: ICharacter|undefined|null }) {
    if (!attacker) return;

    const playerUsername = (attacker as IPlayer).username;
    if (!playerUsername) return;

    this.lastAttackTick[playerUsername] = 30;

    this.currentlyTicking[playerUsername] = this.currentlyTicking[playerUsername] || 30;

    this.runningDamageTotals[playerUsername] = this.runningDamageTotals[playerUsername] || 0;
    this.runningDamageTotals[playerUsername] += damage;

    this.tenSecDamageTotals[playerUsername] = this.tenSecDamageTotals[playerUsername] || 0;
    this.tenSecDamageTotals[playerUsername] += damage;
  }

  override death(killer: ICharacter|undefined|null) {
    const npc = this.npc;
    this.game.worldManager.getMap(npc.map)?.state.getNPCSpawner(npc.uuid)?.forceSpawnNPC();
  }
}
