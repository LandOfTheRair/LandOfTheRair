import { Injectable } from 'injection-js';

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
    if (!defender || this.game.characterHelper.isDead(defender)) return;

    // it _could_ be a heal...
    if (damage > 0) {
      this.game.characterHelper.engageInCombat(defender);
    }

    const modifiedDamage = this.game.combatHelper.modifyDamage(null, defender, {
      damage,
      damageClass,
    });

    this.game.characterHelper.damage(defender, modifiedDamage);

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

    if (this.game.characterHelper.isDead(defender)) {
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
          sfx: this.game.characterHelper.isPlayer(defender)
            ? SoundEffect.CombatDie
            : SoundEffect.CombatKill,
          except: [defender.uuid],
        },
        [
          MessageType.Combat,
          MessageType.NotMe,
          MessageType.Kill,
          this.game.characterHelper.isPlayer(defender)
            ? MessageType.Player
            : MessageType.NPC,
        ],
        [defender],
      );

      this.game.deathHelper.die(defender);
    }
  }
}
