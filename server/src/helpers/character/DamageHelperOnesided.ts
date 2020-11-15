
import { Injectable } from 'injection-js';

import { BaseService, DamageClass, ICharacter, MessageType, SoundEffect } from '../../interfaces';
import { MessageHelper } from '../game';

interface OnesidedDamageArgs {
  damage: number;
  damageClass: DamageClass;
  damageMessage: string;
  suppressIfNegative?: boolean;
  overrideSfx?: SoundEffect;
}

@Injectable()
export class DamageHelperOnesided extends BaseService {

  constructor(
    private messageHelper: MessageHelper
  ) {
    super();
  }

  public init() {}

  public dealOnesidedDamage(
    defender: ICharacter,
    { damage, damageClass, damageMessage, suppressIfNegative, overrideSfx }: OnesidedDamageArgs
  ): void {
    if (!defender || this.game.characterHelper.isDead(defender)) return;

    const modifiedDamage = this.game.combatHelper.modifyDamage(undefined, defender, {
      damage,
      damageClass
    });

    this.game.characterHelper.damage(defender, modifiedDamage);

    if ((modifiedDamage <= 0 && !suppressIfNegative) || modifiedDamage > 0) {
      this.messageHelper.sendLogMessageToPlayer(
        defender,
        { message: `${damageMessage} [${modifiedDamage} ${damageClass} damage]`, sfx: overrideSfx },
        [MessageType.Combat, MessageType.Other, MessageType.Hit]
      );
    }

    if (this.game.characterHelper.isDead(defender)) {
      this.messageHelper.sendLogMessageToPlayer(
        defender,
        { message: `You died!`, sfx: SoundEffect.CombatDie },
        [MessageType.Combat, MessageType.Other, MessageType.Kill]
      );

      this.game.deathHelper.die(defender);
    }
  }

}
