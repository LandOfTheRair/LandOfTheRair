import { ICharacter, IStatusEffect, Stat } from '../../../../interfaces';
import { Effect } from '../../../../models';

enum MoodStatus {
  Calm = 0,
  Agitated = 1,
  Normal = 2,
  Angered = 3,
  Desperate = 4,
  Enraged = 5
}

const moods = [
  { color: '#008080', text: 'This creature is calm. -25% Damage',         damageFactor: -0.25 },
  { color: '#5f5f00', text: 'This creature is agitated. -10% Damage',     damageFactor: -0.1 },
  { color: '#004000', text: 'This creature is acting normally.',          damageFactor: 0 },
  { color: '#664200', text: 'This creature is angered. +10% Damage',      damageFactor: 0.1 },
  { color: '#ff0000', text: 'This creature is desperate. +25% Damage',    damageFactor: 0.25 },
  { color: '#330000', text: 'This creature is enraged! +50% Damage',      damageFactor: 0.5 }
];

export class Mood extends Effect {

  public override apply(char: ICharacter, effect: IStatusEffect) {
    this.changeMood(char, effect, MoodStatus.Calm);
  }

  override tick(char: ICharacter, effect: IStatusEffect) {

    // reset when out of combat
    if (char.combatTicks <= 0) {
      this.game.characterHelper.heal(char, Math.floor(char.hp.maximum * 0.003));
      this.changeMood(char, effect, MoodStatus.Calm);
      effect.effectInfo.startTimer = 0;
    }

    if (!effect.effectInfo.startTimer) effect.effectInfo.startTimer = Date.now();

    if (effect.effectInfo.enrageTimer
    && effect.effectInfo.startTimer
    && effect.effectInfo.startTimer + effect.effectInfo.enrageTimer < Date.now()) {
      this.changeMood(char, effect, MoodStatus.Enraged);
      return;
    }

    const hpPercent = char.hp.current / char.hp.maximum * 100;

    // > 90% HP = Calm
    if (hpPercent >= 90) {
      this.changeMood(char, effect, MoodStatus.Calm);
      return;
    }

    if (hpPercent >= 75) {
      this.changeMood(char, effect, MoodStatus.Agitated);
      return;
    }

    if (hpPercent >= 50) {
      this.changeMood(char, effect, MoodStatus.Normal);
      return;
    }

    if (hpPercent >= 25) {
      this.changeMood(char, effect, MoodStatus.Angered);
      return;
    }

    this.changeMood(char, effect, MoodStatus.Desperate);
  }

  private changeMood(char: ICharacter, effect: IStatusEffect, mood: MoodStatus): void {
    if (mood === effect.effectInfo.currentMood) return;

    effect.effectInfo.currentMood = mood;
    effect.effectInfo.tooltip = moods[mood].text;
    effect.effectInfo.tooltipColor = moods[mood].color;
    effect.effectInfo.statChanges = effect.effectInfo.statChanges || {};
    effect.effectInfo.statChanges[Stat.DamageFactor] = moods[mood].damageFactor;

    this.game.characterHelper.calculateStatTotals(char);
  }

}
