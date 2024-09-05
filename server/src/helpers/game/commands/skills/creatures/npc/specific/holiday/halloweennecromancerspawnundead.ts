import { ICharacter } from '../../../../../../../../interfaces';
import { SpellCommand } from '../../../../../../../../models/macro';

export class HalloweenNecromancerSpawnUndead extends SpellCommand {
  override aliases = ['halloweennecromancerspawnundead'];
  override requiresLearn = true;

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return !this.game.effectHelper.hasEffect(caster, 'FindFamiliar');
  }

  override mpCost(): number {
    return 0;
  }

  override use(executor: ICharacter, target: ICharacter) {
    if (this.game.characterHelper.isPlayer(executor)) return;

    this.game.messageHelper.sendLogMessageToRadius(executor, 8, {
      message: 'Come forth, my most powerful subjects!',
    });
    const summonCreatures = ['Halloween Horror', 'Halloween Horror'];
    this.game.effectHelper.addEffect(executor, executor, 'FindFamiliar', {
      effect: { duration: -1, extra: { summonCreatures } },
    });
  }
}
