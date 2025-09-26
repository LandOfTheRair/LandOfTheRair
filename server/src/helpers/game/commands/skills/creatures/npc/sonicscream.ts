import { DamageClass, ICharacter } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class SonicScream extends SpellCommand {
  override aliases = ['sonicscream'];
  override requiresLearn = true;

  override canUse(): boolean {
    return true;
  }

  override mpCost(): number {
    return 0;
  }

  override use(executor: ICharacter, target: ICharacter) {
    if (this.game.characterHelper.isPlayer(executor)) return;

    this.game.worldManager
      .getMapStateForCharacter(executor)
      ?.getAllPlayersInRange(executor, 5)
      .forEach((char) => {
        this.game.effectHelper.addEffect(char, executor, 'Fear', {
          effect: {
            duration: 5,
            extra: { disableMessages: true, disableRecently: true },
          },
        });

        this.game.combatHelper.magicalAttack(executor, target, {
          damage: 300,
          damageClass: DamageClass.Sonic,
          atkMsg: 'You scream deafeningly at %0!',
          defMsg: '%0 screams piercingly at you!',
        });
      });
  }
}
