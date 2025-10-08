import { Injectable } from 'injection-js';

import { engageInCombat, isDead, isPlayer, takeDamage } from '@lotr/characters';
import type { ICharacter, OnesidedDamageArgs } from '@lotr/interfaces';
import { MessageType, SoundEffect } from '@lotr/interfaces';
import { BaseService } from '../../models/BaseService';

@Injectable()
export class DamageHelperOnesided extends BaseService {
  public init() {}

  public dealOnesidedDamage(
    defender: ICharacter,
    {
      damage,
      damageClass,
      damageMessage,
      suppressIfNegative,
      overrideSfx,
    }: OnesidedDamageArgs,
  ): void {
    if (!defender || isDead(defender)) return;

    // it _could_ be a heal...
    if (damage > 0) {
      engageInCombat(defender);
    }

    const modifiedDamage = this.game.combatHelper.modifyDamage(
      undefined,
      defender,
      {
        damage,
        damageClass,
      },
    );

    takeDamage(defender, modifiedDamage);

    if ((modifiedDamage <= 0 && !suppressIfNegative) || modifiedDamage > 0) {
      this.game.messageHelper.sendLogMessageToPlayer(
        defender,
        {
          message: `${damageMessage} [${modifiedDamage} ${damageClass} damage]`,
          sfx: overrideSfx,
        },
        [MessageType.Combat, MessageType.Other, MessageType.Hit],
      );
    }

    if (isDead(defender)) {
      this.game.messageHelper.sendLogMessageToPlayer(
        defender,
        { message: 'You died!', sfx: SoundEffect.CombatDie },
        [MessageType.Combat, MessageType.Other, MessageType.Kill],
      );

      this.game.messageHelper.sendLogMessageToRadius(
        defender,
        5,
        {
          message: '%0 was slain!',
          sfx: isPlayer(defender)
            ? SoundEffect.CombatDie
            : SoundEffect.CombatKill,
          except: [defender.uuid],
        },
        [
          MessageType.Combat,
          MessageType.NotMe,
          MessageType.Kill,
          isPlayer(defender) ? MessageType.Player : MessageType.NPC,
        ],
        [defender],
      );

      this.game.deathHelper.die(defender);
    }
  }
}
