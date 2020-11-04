
import { Injectable } from 'injection-js';

import { BaseService, DamageClass, ICharacter, Stat } from '../../interfaces';
import { MessageHelper } from '../game';
import { CharacterHelper } from './CharacterHelper';

interface OnesidedDamageArgs {
  damage: number;
  damageClass: DamageClass;
  damageMessage: string;
  suppressIfNegative?: boolean;
  overrideSfx?: string;
}

@Injectable()
export class CombatHelper extends BaseService {

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

    const isHeal = damage < 0;

    if (!isHeal) {
      const damageReduced = this.game.characterHelper.getStat(defender, `${damageClass}Resist` as Stat);
      damage -= damageReduced;

      // non-physical attacks are magical
      if (damageClass !== DamageClass.Physical && damageClass !== DamageClass.GM) {
        const magicReduction = this.game.characterHelper.getStat(defender, Stat.MagicalResist);
        damage -= magicReduction;
      }
    }

    if (!isHeal && damage < 0) damage = 0;

    this.game.characterHelper.damage(defender, damage);

    if ((damage <= 0 && !suppressIfNegative) || damage > 0) {
      this.messageHelper.sendLogMessageToPlayer(defender, { message: `${damageMessage} [${damage} ${damageClass} damage]`, subClass: 'combat other hit', sfx: overrideSfx });
    }

    if (this.game.characterHelper.isDead(defender)) {
      this.messageHelper.sendLogMessageToPlayer(defender, { message: `You died!`, subClass: 'combat other kill', sfx: 'combat-die' });
      this.game.characterHelper.die(defender);
    }
  }

}
