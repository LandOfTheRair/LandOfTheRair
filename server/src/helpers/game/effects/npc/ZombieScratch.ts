
import { Alignment, Allegiance, Hostility, ICharacter, INPC, IStatusEffect, MonsterClass } from '../../../../interfaces';
import { Effect } from '../../../../models';

export class ZombieScratch extends Effect {

  public override apply(char: ICharacter) {
    this.game.messageHelper.sendLogMessageToRadius(char, 4, { from: char.name, message: 'Aaaah! Help me! I\'ve been scratched!' });
  }

  public override unapply(char: ICharacter, effect: IStatusEffect) {
    if (this.game.characterHelper.isDead(char)) return;
    const npc = char as INPC;

    this.game.messageHelper.sendLogMessageToRadius(char, 4, { message: `${char.name} undergoes a horrific transformation!` });

    this.game.characterHelper.healToFull(char);
    const ai = this.game.worldManager.getMap(char.map)?.state.getNPCSpawner(char.uuid)?.getNPCAI(char.uuid);
    ai?.resetAgro(true);

    if (effect.sourceUUID) {
      const mapState = this.game.worldManager.getMap(char.map)?.state;
      const caster = mapState?.getCharacterByUUID(effect.sourceUUID);

      if (caster) {
        this.game.characterHelper.clearAgro(caster, char);
      }
    }

    npc.name = 'zombie';
    npc.allegiance = Allegiance.Enemy;
    npc.hostility = Hostility.Always;
    npc.sprite = 1465;
    npc.alignment = Alignment.Evil;
    npc.monsterClass = MonsterClass.Undead;
    npc.monsterGroup = 'Zombie';
    npc.allegianceReputation = {
      [Allegiance.Enemy]: -101,
      [Allegiance.None]: -101,
      [Allegiance.Pirates]: -101,
      [Allegiance.Townsfolk]: -101,
      [Allegiance.Royalty]: -101,
      [Allegiance.Adventurers]: -101,
      [Allegiance.Wilderness]: -101,
      [Allegiance.Underground]: -101
    };

    npc.npcId = 'Halloween Zombie';
    npc.usableSkills.push({ result: 'ShredTenPercent', chance: 5 } as any, { result: 'HalloweenZombieScratch', chance: 5 } as any);
    npc.drops = npc.drops || [];
    npc.drops.push(
      { result: 'Halloween Zombie Brain', chance: 1, maxChance: 4 },
      { result: 'Halloween Pumpkin Shield', chance: 1, maxChance: 15000 },
      { result: 'Halloween Moon Boots', chance: 1, maxChance: 75000 }
    );
  }

}
