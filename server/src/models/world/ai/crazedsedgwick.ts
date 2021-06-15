
import { DamageClass } from '../../../interfaces';
import { DefaultAIBehavior } from './default';

export class CrazedSedgwickAIBehavior extends DefaultAIBehavior {

  private trigger75 = false;
  private trigger50 = false;
  private trigger25 = false;

  private blast() {
    const npc = this.npc;

    const msgObject = { from: npc.name, message: 'HIYAAAAAAAAAH! Take THIS!', subClass: 'chatter' };
    this.game.messageHelper.sendMessageToMap(npc.map, msgObject);

    setTimeout(() => {
      if (this.game.characterHelper.isDead(npc)) return;

      const players = this.game.worldManager.getPlayersInMap(npc.map);
      players.forEach(p => {
        if (p.x === 21 && p.y === 6) {
          this.game.messageHelper.sendSimpleMessage(p, '_A magical barrier protects you from Sedgwick\'s magic!_');
          return;
        }

        this.game.combatHelper.magicalAttack(npc, p, {
          damage: 1500,
          damageClass: DamageClass.Energy,
          atkMsg: 'You blast %0 with energy!',
          defMsg: '%0 blasted you with a wave of energy!'
        });
      });
    }, 5000);

  }

  override mechanicTick(): void {

    const npc = this.npc;
    const hpPercent = npc.hp.current / npc.hp.maximum * 100;

    if (!this.trigger75 && hpPercent <= 75) {
      this.trigger75 = true;

      setTimeout(() => this.blast(), 3000);
    }

    if (!this.trigger50 && hpPercent <= 50) {
      this.trigger50 = true;

      setTimeout(() => this.blast(), 3000);

    }

    if (!this.trigger25 && hpPercent <= 25) {
      this.trigger25 = true;

      setTimeout(() => this.blast(), 3000);

    }
  }

  override damageTaken(): void {

  }

  override death(): void {
    const npc = this.npc;

    this.game.messageHelper.sendMessageToMap(npc.map, { from: npc.name, message: 'CURSE YOU!' });
    this.game.messageHelper.sendMessageToMap(npc.map, { message: 'You hear a lock click in the distance.' });

    const chestDoor = this.game.worldManager.getMap(npc.map)?.map.findInteractableByName('Chest Door');
    chestDoor.properties.requireLockpick = false;
  }

}
