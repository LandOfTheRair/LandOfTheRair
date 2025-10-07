import { getSkillLevel } from '@lotr/characters';
import { hasEffect } from '@lotr/effects';
import type { ICharacter, IStatusEffect } from '@lotr/interfaces';
import { Skill, Stat } from '@lotr/interfaces';
import { sampleSize } from 'lodash';
import { Song } from './Song';

export class PowerBalladSong extends Song {
  public override create(char: ICharacter, effect: IStatusEffect) {
    effect.effectInfo.potency = Math.floor(
      Math.max(1, getSkillLevel(char, Skill.Thievery) / 6),
    );
    effect.effectInfo.statChanges = {
      [Stat.STR]: effect.effectInfo.potency,
      [Stat.INT]: effect.effectInfo.potency,
      [Stat.WIS]: effect.effectInfo.potency,
    };

    this.sendMessage(char, { message: 'You begin singing a ballad of power!' });
  }

  override tick(char: ICharacter, effect: IStatusEffect) {
    super.tick(char, effect);

    if ((effect.effectInfo.currentTick ?? 0) % 5 === 0) {
      sampleSize(
        this.game.worldManager
          .getMapStateForCharacter(char)
          ?.getAllAlliesInRange(char, 4),
        12,
      ).forEach((ally) => {
        if (char === ally) return;

        if (!hasEffect(ally, 'TargetSong')) {
          this.sendMessage(ally, { message: 'You hear a ballad of power!' });
        }

        this.game.effectHelper.addEffect(ally, char, 'TargetSong', {
          effect: {
            duration: 10,
            extra: {
              hideTicks: true,
              effectIcon: 'music-spell',
              tooltipName: 'Song',
              tooltipColor: '#a00',
              tooltip: `+${effect.effectInfo.potency} STR/INT/WIS`,
              statChanges: {
                [Stat.STR]: effect.effectInfo.potency,
                [Stat.INT]: effect.effectInfo.potency,
                [Stat.WIS]: effect.effectInfo.potency,
              },
            },
          },
        });
      });
    }
  }
}
