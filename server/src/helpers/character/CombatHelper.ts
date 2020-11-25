
import { Injectable } from 'injection-js';

import { BaseService, CombatEffect, DamageClass, GameServerResponse, ICharacter, IPlayer, ISimpleItem, ItemClass,
  MessageType, OnesidedDamageArgs, PhysicalAttackArgs, SoundEffect, Stat } from '../../interfaces';
import { DamageHelperOnesided } from './DamageHelperOnesided';
import { DamageHelperPhysical } from './DamageHelperPhysical';

interface DamageArgs {
  damage: number;
  damageClass: DamageClass;
  isMelee?: boolean;
  attackerDamageMessage?: string;
  defenderDamageMessage?: string;
  attackerWeapon?: ISimpleItem;
  isRanged?: boolean;
  isOverTime?: boolean;
  isHeal?: boolean;
  isWeak?: boolean;
  isStrong?: boolean;
  isAttackerVisible?: boolean;
  customSfx?: SoundEffect;
}

@Injectable()
export class CombatHelper extends BaseService {

  constructor(
    private onesided: DamageHelperOnesided,
    // private magic: DamageHelperMagic,
    private physical: DamageHelperPhysical
  ) {
    super();
  }

  public init() {}

  // damage from the world, traps, etc
  public dealOnesidedDamage(defender: ICharacter, args: OnesidedDamageArgs): void {
    this.onesided.dealOnesidedDamage(defender, args);
  }

  // do damage from one person to another, physically
  public physicalAttack(attacker: ICharacter, defender: ICharacter, args: PhysicalAttackArgs = {}): void {
    this.physical.physicalAttack(attacker, defender, args);
  }

  public combatEffect(target: ICharacter, defenderUUID: string, effect: CombatEffect): void {
    this.game.transmissionHelper.sendResponseToPlayer(target as IPlayer, GameServerResponse.PlayCFX, { defenderUUID, effect });
  }

  public modifyDamage(attacker: ICharacter | undefined, defender: ICharacter, args: DamageArgs): number {
    const baseDamage = args.damage;
    const isHeal = baseDamage < 0;

    let mitigatedPercent = 0;
    let damage = args.damage;

    if (attacker) {
      if (!args.isMelee) {
        damage += this.game.characterHelper.getStat(attacker, Stat.MagicalBoost);
      }
    }

    if (!isHeal) {

      // check for resistance to the damage type
      const damageReduced = this.game.characterHelper.getStat(defender, `${args.damageClass}Resist` as Stat);
      damage -= damageReduced;

      // non-physical attacks are magical
      if (!args.isMelee && args.damageClass !== DamageClass.GM) {
        const magicReduction = this.game.characterHelper.getStat(defender, Stat.MagicalResist);
        damage -= magicReduction;
      }

      mitigatedPercent = (damage / baseDamage);

      if (damage < 0) damage = 0;

    // boost healing
    } else if (attacker) {
      damage -= this.game.characterHelper.getStat(attacker, Stat.HealingBoost);

    }

    if (isNaN(damage)) damage = 0;

    return Math.floor(damage);
  }

  public dealDamage(attacker: ICharacter, defender: ICharacter, args: DamageArgs): void {
    if (this.game.characterHelper.isDead(defender)) return;

    const { damage, attackerWeapon, isHeal, isMelee, isOverTime,
      damageClass, attackerDamageMessage, defenderDamageMessage, customSfx } = args;

    // if no damage, bail
    if (attacker && attacker !== defender && damage === 0) {

      this.game.messageHelper.sendLogMessageToPlayer(attacker,
        {
          message: `Your attack did no visible damage!`,
          logInfo: {
            type: 'hit-physical',
            uuid: attacker ? attacker.uuid : '???',
            weapon: attackerWeapon ? attackerWeapon.name : '???',
            damage: 0,
            monsterName: defender.name
          }
        },
        [MessageType.Combat, MessageType.Self, MessageType.Blocked]
      );

      return;
    }

    const absDmg = Math.round(Math.abs(damage));
    const dmgString = isHeal ? 'health' : `${damageClass} damage`;

    const otherClass = isHeal ? MessageType.Heal : MessageType.Hit;
    const damageType = isMelee ? MessageType.Melee : MessageType.Magic;

    const itemClass = this.game.itemHelper.getItemProperty(attackerWeapon, 'itemClass');

    // tell the attacker something's going on
    if (attackerDamageMessage && attacker) {

      const secondaryClass = attacker !== defender ? MessageType.Self : MessageType.Other;

      const formattedAtkMessage = this.game.messageHelper.formatMessage(attacker, attackerDamageMessage, [defender]);

      const messageTypes = [MessageType.Combat, secondaryClass, otherClass, damageType];
      if (isOverTime) messageTypes.push(MessageType.OutOvertime);

      this.game.messageHelper.sendLogMessageToPlayer(attacker,
        {
          message: `${formattedAtkMessage} [${absDmg} ${dmgString}]`,
          sfx: customSfx || this.determineSfx({ itemClass, isMelee, damage }),
          logInfo: {
            type: 'damage',
            uuid: attacker ? attacker.uuid : '???',
            weapon: attackerWeapon ? itemClass : '???',
            damage,
            monsterName: defender.name
          }
        },
        messageTypes
      );
    }

    // let the defender know they got hit or something
    if (defenderDamageMessage && defender && attacker !== defender) {

      const formattedDefMessage = this.game.messageHelper.formatMessage(defender, defenderDamageMessage, [attacker]);

      const messageTypes = [MessageType.Combat, MessageType.Other, otherClass, damageType];
      if (isOverTime) messageTypes.push(MessageType.InOvertime);

      this.game.messageHelper.sendLogMessageToPlayer(defender,
        {
          message: `${formattedDefMessage} [${absDmg} ${dmgString}]`,
          logInfo: {
            type: 'damage',
            uuid: attacker ? attacker.uuid : '???',
            weapon: attackerWeapon ? itemClass : '???',
            damage,
            monsterName: attacker ? attacker.name : '???'
          }
        },
        messageTypes
      );
    }

    // finally, absolutely finally, we can do some damage
    this.game.characterHelper.damage(defender, args.damage);

    // lets see if they died
    const wasFatal = this.game.characterHelper.isDead(defender);
    if (wasFatal) {

      // if there was an attacker, we send a lot of messages
      if (attacker) {

        console.log(attacker.name, 'attack', defender.name);

        // let the defender know they were killed in an aoe
        this.game.messageHelper.sendLogMessageToRadius(defender, 5, {
          message: `%0 was slain by %1!`,
          sfx: SoundEffect.CombatDie,
          except: [defender.uuid, attacker.uuid]
        }, [
          MessageType.Combat, MessageType.NotMe, MessageType.Kill,
          this.game.characterHelper.isPlayer(defender) ? MessageType.Player : MessageType.NPC
        ], [defender, attacker]);

        // let the killer know they murdered someone
        const killMsg = this.game.messageHelper.formatMessage(attacker, `You killed %0!`, [defender]);
        this.game.messageHelper.sendLogMessageToPlayer(attacker, {
          message: killMsg,
          sfx: this.game.characterHelper.isPlayer(defender) ? SoundEffect.CombatDie : SoundEffect.CombatKill,
          setTarget: null
        });

        // let the target know they died
        const dieMsg = this.game.messageHelper.formatMessage(defender, `You were killed by %0!`, [attacker]);
        this.game.messageHelper.sendLogMessageToPlayer(defender, {
          message: dieMsg,
          setTarget: null,
          sfx: SoundEffect.CombatDie,
        }, [
          MessageType.Combat, MessageType.Other, MessageType.Kill
        ]);

        // only call kill() for players
        if (this.game.characterHelper.isPlayer(attacker)) {
          this.game.deathHelper.kill(attacker, defender);
        }

        // but everyone die()s
        this.game.deathHelper.die(defender, attacker);

      // otherwise, we just let everyone know this person died. probably their own fault. probably.
      } else {
        this.game.messageHelper.sendLogMessageToRadius(defender, 5, {
          message: `${defender.name} was killed!`,
          sfx: SoundEffect.CombatDie,
        }, [MessageType.Combat, MessageType.Self, MessageType.Kill]);

        this.game.messageHelper.sendLogMessageToRadius(defender, 5, {
          message: `You were killed!`,
          sfx: SoundEffect.CombatDie,
        }, [MessageType.Combat, MessageType.Other, MessageType.Kill]);


        this.game.deathHelper.die(defender);
      }


    }
  }

  private determineSfx({ itemClass, isMelee, damage }): SoundEffect | undefined {
    if (damage < 0) return;
    if (itemClass === ItemClass.Blunderbuss) return SoundEffect.CombatSpecialBlunderbuss;

    return isMelee ? SoundEffect.CombatHitMelee : SoundEffect.CombatHitSpell;
  }

}
