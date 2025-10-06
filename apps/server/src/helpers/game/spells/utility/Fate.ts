import { gainCurrency } from '@lotr/currency';
import { calculateXPRequiredForLevel } from '@lotr/exp';
import type { ICharacter, IPlayer, SpellCastArgs } from '@lotr/interfaces';
import { Currency, LearnedSpell, Stat } from '@lotr/interfaces';
import { Spell } from '../../../../models/world/Spell';

export class Fate extends Spell {
  override cast(
    caster: ICharacter | null,
    target: ICharacter | null,
    spellCastArgs: SpellCastArgs,
  ): void {
    if (!caster) return;
    if (!this.game.characterHelper.isPlayer(caster)) return;

    const player = caster as IPlayer;

    if (player.exp < calculateXPRequiredForLevel(15) || player.level < 15) {
      return this.sendMessage(player, { message: 'There was no effect.' });
    }

    const fateData = this.game.contentManager.fateData;
    const res: any = this.game.lootHelper.chooseWithoutReplacement(
      fateData.event,
    );

    let message = res[0].message || '';
    const {
      stats,
      effect,
      allegiance,
      sex,
      xp,
      megaXp,
      currency,
      statBoost,
      learnSpell,
      unlearnSpell,
    } = res[0];

    if (sex) {
      if (sex === caster.gender) message = 'There was no effect.';
      caster.gender = sex;
    }

    if (allegiance) {
      if (allegiance === caster.allegiance) message = 'There was no effect.';
      caster.allegiance = allegiance;
    }

    if (stats) {
      Object.keys(stats || {}).forEach((statType) => {
        const base = this.game.characterHelper.getBaseStat(
          caster,
          statType as Stat,
        );
        if (base + stats[statType] < 5 || base + stats[statType] > 25) {
          message = "Your chest feels like it's on fire!";
          return;
        }

        this.game.characterHelper.gainPermanentStat(
          caster,
          statType as Stat,
          stats[statType] ?? 1,
        );
      });

      this.game.characterHelper.recalculateEverything(caster);
    }

    if (currency) {
      Object.keys(currency || {}).forEach((currencyType) => {
        gainCurrency(caster, currency[currencyType], currencyType as Currency);
      });
    }

    if (effect) {
      this.game.effectHelper.addEffect(caster, 'Fate', effect.name, {
        effect: {
          duration: effect.duration,
          extra: { potency: effect.potency },
        },
      });
    }

    if (xp) {
      if (
        xp > 0 &&
        (!this.game.playerHelper.canGainExpOnMap(player) || player.gainingAXP)
      ) {
        message = "You feel like you could have learned something, but didn't.";
      } else {
        let xpChange = 0;

        if (megaXp) {
          xpChange = Math.floor(player.exp * (xp / 100));
        } else {
          if (xp > 0) {
            const baseXp = calculateXPRequiredForLevel(player.level);
            const neededXp = calculateXPRequiredForLevel(player.level + 1);
            xpChange = Math.floor((neededXp - baseXp) * (xp / 100));
          } else {
            const baseXp = calculateXPRequiredForLevel(player.level);
            xpChange = Math.floor(baseXp * (xp / 100));
          }
        }

        this.game.playerHelper.gainExp(player, xpChange);
      }
    }

    if (statBoost) {
      const boostRes: any = this.game.lootHelper.chooseWithoutReplacement(
        fateData.stat,
      );
      const { stat, divisor, goodmessage, antimessage } = boostRes[0];

      const base = this.game.characterHelper.getBaseStat(caster, stat as Stat);

      let good = false;
      let statBoosting = Math.floor(caster.level / divisor) * statBoost;
      if (base === 0 || this.game.diceRollerHelper.XInOneHundred(35)) {
        good = true;
      }

      message = good ? goodmessage : antimessage;

      if (stat === Stat.HP && base < 100 && !good) {
        statBoosting = 0;
        message = 'You think about it for a moment, then hesitate.';
      }

      if (good) {
        this.game.characterHelper.gainPermanentStat(
          caster,
          stat as Stat,
          statBoosting,
        );
      } else {
        this.game.characterHelper.losePermanentStat(
          caster,
          stat as Stat,
          statBoosting,
        );
      }

      this.game.characterHelper.recalculateEverything(caster);
    }

    if (learnSpell) {
      const learnState = this.game.characterHelper.learnedState(
        caster,
        learnSpell,
      );

      const noFateTraits =
        this.game.contentManager.getClassConfigSetting<'noFateTraits'>(
          player.baseClass,
          'noFateTraits',
        );

      if (
        learnState === LearnedSpell.FromFate ||
        learnState === LearnedSpell.FromTraits ||
        (learnSpell === 'Succor' && noFateTraits.includes('Succor')) ||
        (learnSpell === 'Identify' && noFateTraits.includes('Identify'))
      ) {
        message =
          'You feel a magical energy encompass you for a moment, then it fades.';
      } else {
        this.game.characterHelper.forceSpellLearnStatus(
          caster,
          learnSpell,
          LearnedSpell.FromFate,
        );
        this.game.characterHelper.recalculateLearnedSpells(player);
      }
    }

    if (unlearnSpell) {
      const learnState = this.game.characterHelper.learnedState(
        caster,
        unlearnSpell,
      );
      if (learnState === LearnedSpell.FromFate) {
        this.game.characterHelper.forceSpellLearnStatus(
          caster,
          unlearnSpell,
          LearnedSpell.Unlearned,
        );
      }
    }

    gainCurrency(caster, 1, Currency.Fate);

    this.sendMessage(caster, { message });
  }
}
