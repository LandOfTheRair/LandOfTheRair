import {
  DamageArgs,
  DamageClass,
  ICharacter,
  INPC,
  IStatusEffect,
  SoundEffect,
  Stat,
} from '../../../../../interfaces';
import { Effect } from '../../../../../models';

export class Berserk extends Effect {
  public override create(char: ICharacter, effect: IStatusEffect) {
    effect.effectInfo.currentBerserkTier = 1;
    effect.effectInfo.currentBerserkApplications = 1;
    this.sendBerserkTierMessage(char, effect.effectInfo.currentBerserkTier);
  }

  public override outgoing(
    effect: IStatusEffect,
    char: ICharacter,
    target: ICharacter,
    args: DamageArgs,
  ) {
    if (args.damage <= 0) return;

    const rageGeneratedBoost = this.game.traitHelper.traitLevelValue(
      char,
      'EnragingStrikes',
    );
    this.game.characterHelper.mana(char, rageGeneratedBoost);
  }

  public override incoming(
    effect: IStatusEffect,
    char: ICharacter,
    attacker: ICharacter | null,
    damageArgs: DamageArgs,
    currentDamage: number,
  ): number {
    if (
      damageArgs.damageClass !== DamageClass.Physical &&
      this.game.diceRollerHelper.XInOneHundred(
        this.game.traitHelper.traitLevelValue(char, 'MagicalVortex'),
      )
    ) {
      this.game.characterHelper.heal(char, currentDamage);

      this.sendMessage(char, {
        message: `Yummy magics!`,
      });

      return 0;
    }

    return currentDamage;
  }

  public override tick(char: ICharacter, effect: IStatusEffect) {
    super.tick(char, effect);

    effect.effectInfo.currentBerserkTier ??= 0;
    effect.effectInfo.ticksWithoutBerserking ??= 0;
    effect.effectInfo.ticksWithoutBerserking += 1;

    if (
      effect.effectInfo.ticksWithoutBerserking >= 30 &&
      effect.effectInfo.currentBerserkTier > 1
    ) {
      effect.effectInfo.ticksWithoutBerserking = 0;
      effect.effectInfo.currentBerserkTier -= 1;
      effect.effectInfo.currentBerserkApplications = 0;

      this.sendBerserkTierMessage(char, effect.effectInfo.currentBerserkTier);
      this.updateStats(char, effect);
    }

    let targetUUID = char.lastTargetUUID;
    if (!targetUUID) {
      const target = this.acquireHeadToSmash(char);

      if (target) {
        targetUUID = target.uuid;
      }

      if (!targetUUID) {
        this.searchForAnotherHeadToSmash(char, effect);
        return;
      }
    }

    if (targetUUID) {
      const target = this.acquireHeadToSmash(char, targetUUID);

      if (!target) {
        char.lastTargetUUID = '';
        this.searchForAnotherHeadToSmash(char, effect);
        return;
      }

      this.game.movementHelper.moveTowards(char, target);

      const numAttacks = this.berserkTierNumAttacks(
        effect.effectInfo.currentBerserkTier ?? 1,
      );

      for (let i = 0; i < numAttacks; i++) {
        this.game.combatHelper.physicalAttack(char, target);
      }
    }

    char.lastTargetUUID = targetUUID;
  }

  public override recast(effect: IStatusEffect, char: ICharacter) {
    effect.effectInfo.ticksWithoutBerserking = 0;
    effect.effectInfo.currentBerserkTier ??= 1;
    effect.effectInfo.currentBerserkApplications ??= 1;

    effect.effectInfo.currentBerserkApplications += 1;

    // boost tier if possible
    if (
      effect.effectInfo.currentBerserkApplications >= 5 &&
      effect.effectInfo.currentBerserkTier < this.maxBerserkTier(char)
    ) {
      effect.effectInfo.currentBerserkApplications = 0;
      effect.effectInfo.currentBerserkTier += 1;
      this.sendBerserkTierMessage(char, effect.effectInfo.currentBerserkTier);
      this.updateStats(char, effect);
    }

    // increase time left based on tier
    const ticksLeft = Math.floor((effect.endsAt - Date.now()) / 1000);
    const newTicksLeft = Math.min(
      this.maxDuration(effect.effectInfo.currentBerserkTier),
      ticksLeft + 30,
    );

    effect.endsAt = Date.now() + newTicksLeft * 1000;
  }

  // reusable actions
  private acquireHeadToSmash(
    char: ICharacter,
    targetUUID = '',
  ): ICharacter | null {
    return this.game.targettingHelper
      .getPossibleTargetsInViewRange(char, targetUUID)
      .filter((target) => {
        if (target === char) return false;
        if (this.game.characterHelper.isPlayer(target)) return false;
        if (
          (target as INPC).owner &&
          this.game.characterHelper.isPlayer((target as INPC).owner!)
        ) {
          return false;
        }

        return true;
      })[0];
  }

  private searchForAnotherHeadToSmash(char: ICharacter, effect: IStatusEffect) {
    if ((effect.effectInfo.currentTick ?? 0) % 5 !== 0) return;
    if ((effect.effectInfo.currentBerserkTier ?? 0) < 2) return;

    this.sendMessage(char, {
      message: 'You search for another head to smash!',
    });
    this.game.movementHelper.moveRandomly(char, 3);
    this.game.characterHelper.manaDamage(char, 3);
  }

  // tier actions
  private updateStats(char: ICharacter, effect: IStatusEffect) {
    const stats = this.berserkTierStats(
      effect.effectInfo.currentBerserkTier ?? 1,
      char,
    );

    effect.effectInfo.statChanges = stats;

    this.game.characterHelper.calculateStatTotals(char);

    this.updateDescription(effect);
  }

  private updateDescription(effect: IStatusEffect) {
    const statBoosts = [
      effect.effectInfo.statChanges?.[Stat.HP]
        ? `+${effect.effectInfo.statChanges[Stat.HP]} HP`
        : null,
      effect.effectInfo.statChanges?.[Stat.HPRegen]
        ? `+${effect.effectInfo.statChanges[Stat.HPRegen]} HP Regen`
        : null,
      effect.effectInfo.statChanges?.[Stat.MP]
        ? `+${effect.effectInfo.statChanges[Stat.MP]} Rage`
        : null,
      effect.effectInfo.statChanges?.[Stat.STR]
        ? `+${effect.effectInfo.statChanges[Stat.STR]} STR`
        : null,
      effect.effectInfo.statChanges?.[Stat.Offense]
        ? `+${effect.effectInfo.statChanges[Stat.Offense]} Offense`
        : null,
      effect.effectInfo.statChanges?.[Stat.WeaponDamageRolls]
        ? `+${effect.effectInfo.statChanges[Stat.WeaponDamageRolls]} Weapon Damage Rolls`
        : null,
      effect.effectInfo.statChanges?.[Stat.PhysicalReflect]
        ? `+${effect.effectInfo.statChanges[Stat.PhysicalReflect]} Physical Reflect`
        : null,
      effect.effectInfo.statChanges?.[Stat.PhysicalBoostPercent]
        ? `+${effect.effectInfo.statChanges[Stat.PhysicalBoostPercent]}% Physical Boost`
        : null,
    ]
      .filter(Boolean)
      .join(', ');

    effect.effectInfo.tooltip = `${this.berserkTierShortname(effect.effectInfo.currentBerserkTier ?? 1)}. ${statBoosts}`;
  }

  private sendBerserkTierMessage(char: ICharacter, tier: number) {
    this.sendMessage(char, {
      message: this.berserkTierMessage(tier),
      sfx: SoundEffect.SpellSpecialBerserk,
    });

    this.game.messageHelper.sendLogMessageToRadius(char, 8, {
      message: 'Aaaaayyyyyyeeeeeearghhhhhhhh!',
      from: char.name,
    });
  }

  // tier math
  private berserkTierNumAttacks(tier: number): number {
    if (tier === 5) return 5;
    if (tier === 4) return 4;
    if (tier === 3) return 3;
    if (tier === 2) return 2;
    return 1;
  }

  private berserkTierStats(
    tier: number,
    character: ICharacter,
  ): Partial<Record<Stat, number>> {
    const stats = {
      [Stat.HP]: 0,
      [Stat.MP]: 0,
      [Stat.HPRegen]: 0,
      [Stat.STR]: 0,
      [Stat.Offense]: 0,
      [Stat.WeaponDamageRolls]: 0,
      [Stat.PhysicalReflect]: 0,
      [Stat.PhysicalBoostPercent]: 0,
    };

    const charDefense = this.game.characterHelper.getStat(
      character,
      Stat.Defense,
    );

    if (tier >= 2) {
      stats[Stat.HP] += 25 * character.level;
      stats[Stat.MP] += this.game.traitHelper.traitLevelValue(
        character,
        'PooledBerserk',
      );
      stats[Stat.HPRegen] += this.game.traitHelper.traitLevelValue(
        character,
        'RegenerativeBerserk',
      );
    }

    if (tier >= 3) {
      stats[Stat.STR] += 0.2 * character.level;
      stats[Stat.Offense] +=
        this.game.traitHelper.traitLevelValue(character, 'OffensiveDefense') *
        charDefense;
    }

    if (tier >= 4) {
      stats[Stat.Offense] += 0.5 * character.level;
      stats[Stat.PhysicalReflect] = this.game.traitHelper.traitLevelValue(
        character,
        'MirrorSkin',
      );

      if (this.game.traitHelper.traitLevelValue(character, 'DamagingDefense')) {
        stats[Stat.PhysicalBoostPercent] = charDefense;
      }
    }

    if (tier >= 5) {
      stats[Stat.WeaponDamageRolls] += 0.2 * character.level;
    }

    Object.keys(stats).forEach((stat) => {
      stats[stat as Stat] = Math.floor(stats[stat as Stat] ?? 0);
    });

    return stats;
  }

  private berserkTierShortname(tier: number): string {
    if (tier === 5) return 'Rabid';
    if (tier === 4) return 'Frenzied';
    if (tier === 3) return 'Feral';
    if (tier === 2) return 'Unruly';
    return 'Twitchy';
  }

  private berserkTierMessage(tier: number): string {
    if (tier === 5) return "You're a rabid beast!";
    if (tier === 4) return "You're frenzying out of control!";
    if (tier === 3) return "You're filled with a feral rage!";
    if (tier === 2) return "You're feeling unruly!";
    return "You're twitchy!";
  }

  private maxDuration(berserkTier: number): number {
    return 300 + berserkTier * 300;
  }

  private maxBerserkTier(char: ICharacter): number {
    if (this.game.traitHelper.traitLevel(char, 'Berserk:Rabid')) return 5;
    if (this.game.traitHelper.traitLevel(char, 'Berserk:Frenzied')) return 4;
    if (this.game.traitHelper.traitLevel(char, 'Berserk:Feral')) return 3;
    if (this.game.traitHelper.traitLevel(char, 'Berserk:Unruly')) return 2;
    return 1;
  }
}
