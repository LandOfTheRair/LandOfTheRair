
import { Injectable } from 'injection-js';
import { isNumber } from 'lodash';

import { Allegiance, BaseClass, CombatEffect, DamageArgs, DamageClass, GameServerResponse, ICharacter, IPlayer, ItemClass,
  MagicalAttackArgs,
  MessageType, OnesidedDamageArgs, PhysicalAttackArgs, PhysicalAttackReturn, SoundEffect, Stat } from '../../interfaces';
import { BaseService } from '../../models/BaseService';
import { DamageHelperMagic } from './DamageHelperMagic';
import { DamageHelperOnesided } from './DamageHelperOnesided';
import { DamageHelperPhysical } from './DamageHelperPhysical';

@Injectable()
export class CombatHelper extends BaseService {

  constructor(
    private onesided: DamageHelperOnesided,
    private magic: DamageHelperMagic,
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
  public physicalAttack(attacker: ICharacter, defender: ICharacter, args: PhysicalAttackArgs = {}): PhysicalAttackReturn {
    const res = this.physical.physicalAttack(attacker, defender, args);

    if (attacker.baseClass === BaseClass.Warrior) {
      if (res.block || res.dodge) {
        this.game.characterHelper.mana(attacker, this.game.contentManager.getGameSetting('character', 'warriorDodgeRegen') ?? 5);
      }

      if (res.hit) {
        this.game.characterHelper.mana(attacker, this.game.contentManager.getGameSetting('character', 'warriorHitRegen') ?? 3);
      }
    }

    const drainChance = this.game.traitHelper.traitLevelValue(attacker, 'DrainSlash');
    if (drainChance > 0 && this.game.diceRollerHelper.XInOneHundred(drainChance)) {
      this.game.spellManager.castSpell('Drain', attacker, defender);
    }

    const asperChance = this.game.traitHelper.traitLevelValue(attacker, 'AsperSlash');
    if (asperChance > 0 && this.game.diceRollerHelper.XInOneHundred(asperChance)) {
      this.game.spellManager.castSpell('Asper', attacker, defender);
    }

    return res;
  }

  public magicalAttack(attacker: ICharacter | null, defender: ICharacter, args: MagicalAttackArgs = {}): void {
    this.magic.magicalAttack(attacker, defender, args);
  }

  public combatEffect(target: ICharacter, defenderUUID: string, effect: CombatEffect): void {
    this.game.transmissionHelper.sendResponseToPlayer(target as IPlayer, GameServerResponse.PlayCFX, { defenderUUID, effect });
  }

  public modifyDamage(attacker: ICharacter | null, defender: ICharacter, args: DamageArgs): number {
    const baseDamage = args.damage;
    const isHeal = baseDamage < 0;

    // let mitigatedPercent = 0;
    let damage = args.damage;

    if (attacker) {
      if (!args.isMelee) {
        damage += Math.floor(damage * this.game.characterHelper.getStat(attacker, `${args.damageClass}BoostPercent` as Stat) / 100);
        damage += Math.floor(damage * this.game.characterHelper.getStat(attacker, Stat.MagicalBoostPercent) / 100);
      }
    }

    if (!isHeal) {

      // check for resistance to the damage type
      const damageReduced = this.game.characterHelper.getStat(defender, `${args.damageClass}Resist` as Stat);
      damage -= damageReduced;

      // non-physical attacks are magical
      if (!args.isMelee && args.damageClass !== DamageClass.GM && args.damageClass !== DamageClass.Sonic) {
        const magicReduction = this.game.characterHelper.getStat(defender, Stat.MagicalResist);
        damage -= magicReduction;
      }

      if (damage < 0) damage = 0;

    // boost healing
    } else if (attacker) {
      damage -= Math.floor(damage * this.game.characterHelper.getStat(attacker, Stat.HealingBoostPercent) / 100);

    }

    if (attacker) {
      const damageFactor = this.game.characterHelper.getStat(attacker, Stat.DamageFactor);
      damage *= damageFactor;
    }

    // clone the args so we dont accidentally override something
    const damageArgs = Object.assign({}, args);
    damageArgs.damage = damage;
    damage = this.game.effectHelper.modifyIncomingDamage(defender, attacker, damageArgs);

    if (isNaN(damage)) damage = 0;

    return Math.floor(damage);
  }

  // this function directly deals damage without modifying it - the only place this should be called are the damage helpers
  public dealDamage(attacker: ICharacter | null, defender: ICharacter, args: DamageArgs): void {
    if (this.game.characterHelper.isDead(defender)) return;

    const { damage, attackerWeapon, isHeal, isMelee, isOverTime, hasBeenReflected,
      damageClass, attackerDamageMessage, defenderDamageMessage, customSfx } = args;

    if (isNaN(damage)) return;

    const reflectPhysical = this.game.characterHelper.getStat(defender, Stat.PhysicalReflect);
    const reflectMagical = this.game.characterHelper.getStat(defender, Stat.MagicalReflect);

    if (attacker && damage > 0 && reflectPhysical > 0 && damageClass === DamageClass.Physical && !hasBeenReflected) {
      this.dealDamage(defender, attacker, {
        damage: reflectPhysical,
        damageClass: DamageClass.Physical,
        hasBeenReflected: true,
        defenderDamageMessage: '%0 reflected your attack!'
      });
    }

    if (attacker && damage > 0 && reflectMagical > 0 && damageClass !== DamageClass.Physical && !hasBeenReflected) {
      this.dealDamage(defender, attacker, {
        damage: reflectMagical,
        damageClass,
        hasBeenReflected: true,
        defenderDamageMessage: '%0 reflected your attack!'
      });
    }

    // if no damage, bail
    if (attacker && attacker !== defender && damage === 0) {

      this.game.messageHelper.sendLogMessageToPlayer(attacker,
        {
          message: 'Your attack did no visible damage!',
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
          sfx: (args?.attackNum ?? 0) > 0 ? undefined : customSfx || this.determineSfx({ itemClass, isMelee, damage }),
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

    // add agro = to damage
    if (attacker) {
      this.game.characterHelper.addAgro(attacker, defender, args.damage ?? 1);
    }

    // finally, absolutely finally, we can do some damage
    this.game.characterHelper.damage(defender, args.damage);

    // handle outgoing effects that happen post-damage
    if (attacker) {
      this.game.effectHelper.handleOutgoingEffects(attacker, defender, args);
    }

    // try to do some debuffing based on damage element
    this.doElementalDebuffing(defender, args.damageClass, args.damage, attacker);

    // notify the ai if needed
    if (!this.game.characterHelper.isPlayer(defender)) {
      const ai = this.game.worldManager.getMap(defender.map)?.state.getNPCSpawner(defender.uuid)?.getNPCAI(defender.uuid);
      ai?.damageTaken({ damage, attacker });
    }

    // lets see if they died
    const wasFatal = this.game.characterHelper.isDead(defender);
    if (wasFatal) {

      // if there was an attacker, we send a lot of messages
      if (attacker) {

        // let the killer know they murdered someone
        let verb = 'killed';
        if (defender.allegiance === Allegiance.NaturalResource) {
          verb = 'shredded';
          if (defender.name.includes('tree')) verb = 'taken down';
          if (defender.name.includes('vein')) verb = 'smashed';
        }

        // let the defender know they were killed in an aoe
        this.game.messageHelper.sendLogMessageToRadius(defender, 4, {
          message: `%0 was ${verb} by %1!`,
          sfx: this.game.characterHelper.isPlayer(defender) ? SoundEffect.CombatDie : SoundEffect.CombatKill,
          except: [defender.uuid, attacker.uuid]
        }, [
          MessageType.Combat, MessageType.NotMe, MessageType.Kill,
          this.game.characterHelper.isPlayer(defender) ? MessageType.Player : MessageType.NPC
        ], [defender, attacker]);

        const setTargetArgs = isNumber(args.attackNum) ? {} : { setTarget: null };

        const killMsg = this.game.messageHelper.formatMessage(attacker, `You ${verb} %0!`, [defender]);
        this.game.messageHelper.sendLogMessageToPlayer(attacker, {
          message: killMsg,
          sfx: this.game.characterHelper.isPlayer(defender) ? SoundEffect.CombatDie : SoundEffect.CombatKill,
          ...setTargetArgs
        });

        // let the target know they died
        const dieMsg = this.game.messageHelper.formatMessage(defender, 'You were killed by %0!', [attacker]);
        this.game.messageHelper.sendLogMessageToPlayer(defender, {
          message: dieMsg,
          setTarget: null,
          sfx: SoundEffect.CombatDie,
        }, [
          MessageType.Combat, MessageType.Other, MessageType.Kill
        ]);

        // killllllllllllllllllll
        this.game.deathHelper.kill(attacker, defender);

        // but everyone die()s
        this.game.deathHelper.die(defender, attacker);

      // otherwise, we just let everyone know this person died. probably their own fault. probably.
      } else {
        this.game.messageHelper.sendLogMessageToRadius(defender, 4, {
          message: `${defender.name} was killed!`,
          sfx: this.game.characterHelper.isPlayer(defender) ? SoundEffect.CombatDie : SoundEffect.CombatKill,
          except: [defender.uuid]
        }, [MessageType.Combat, MessageType.Self, MessageType.Kill]);

        this.game.messageHelper.sendLogMessageToPlayer(defender, {
          message: 'You were killed!',
          sfx: SoundEffect.CombatDie,
          setTarget: null,
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

  private getElementalDebuff(damageClass: DamageClass): [string, string, string] {
    switch (damageClass) {
    case DamageClass.Fire: return ['BuildupHeat', 'Burning', 'RecentlyBurned'];
    case DamageClass.Ice:  return ['BuildupChill', 'Chilled', 'RecentlyChilled'];
    }

    return ['', '', ''];
  }

  private doElementalDebuffing(defender: ICharacter, damageClass: DamageClass, damage: number, source?: ICharacter | null): void {
    if (damage === 0) return;

    const [buildup, burst, recently] = this.getElementalDebuff(damageClass);
    if (!buildup || !burst || !recently) return;

    if (this.game.effectHelper.hasEffect(defender, burst)
    || this.game.effectHelper.hasEffect(defender, recently)
    || (burst === 'Chilled' && this.game.effectHelper.hasEffect(defender, 'Frozen'))) return;

    const buildupEffect = this.game.effectHelper.getEffect(defender, buildup);
    if (!buildupEffect) {
      const { buildUpDecay, buildUpCurrent, buildUpMax, buildUpScale } = this.game.contentManager.getGameSetting('combat');
      this.game.effectHelper.addEffect(defender, source ?? '', buildup, { effect: { extra: {
        buildUpDecay: buildUpDecay ?? 3,
        buildUpCurrent: buildUpCurrent ?? 5,
        buildUpMax: (buildUpMax ?? 200) + (defender.level * (buildUpScale ?? 10))
      } } });
    }
  }

}
