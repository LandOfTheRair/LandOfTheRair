import { sampleSize } from 'lodash';
import { ICharacter, IStatusEffect, Stat } from '../../../../../interfaces';
import { Song } from './Song';

export class NightmareSerenadeSong extends Song {
  public override create(char: ICharacter, effect: IStatusEffect) {
    this.sendMessage(char, {
      message: 'You begin singing a nightmare serenade!',
    });
  }

  override tick(char: ICharacter, effect: IStatusEffect) {
    super.tick(char, effect);

    if ((effect.effectInfo.currentTick ?? 0) % 5 === 0) {
      sampleSize(
        this.game.worldManager
          .getMapStateForCharacter(char)
          ?.getAllHostilesWithoutVisibilityTo(char, 4),
        12,
      ).forEach((enemy) => {
        if (!this.game.effectHelper.hasEffect(enemy, 'TargetSong')) {
          this.sendMessage(enemy, {
            message: 'You are hit with a nightmare serenade!',
          });
        }

        this.game.effectHelper.addEffect(enemy, char, 'TargetSong', {
          effect: {
            duration: 10,
            extra: {
              hideTicks: true,
              effectIcon: 'music-spell',
              tooltipName: 'Song',
              tooltipColor: '#0aa',
              tooltip: `-${effect.effectInfo.potency} Physical/Magical Resist`,
              statChanges: {
                [Stat.PhysicalResist]: -effect.effectInfo.potency,
                [Stat.MagicalResist]: -effect.effectInfo.potency,
              },
            },
          },
        });
      });
    }
  }
}
