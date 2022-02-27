import { ICharacter, IStatusEffect, Stat } from '../../../../../interfaces';
import { Song } from './Song';

export class AriaOfRefugeSong extends Song {

  public override create(char: ICharacter, effect: IStatusEffect) {

    effect.effectInfo.statChanges = {
      [Stat.PhysicalResist]: effect.effectInfo.potency,
      [Stat.MagicalResist]: effect.effectInfo.potency
    };

    this.sendMessage(char, { message: 'You begin singing an aria of refuge!' });
  }

  override tick(char: ICharacter, effect: IStatusEffect) {
    super.tick(char, effect);

    if (((effect.effectInfo.currentTick ?? 0) % 5) === 0) {
      this.game.worldManager.getMapStateForCharacter(char)?.getAllAlliesInRange(char, 4).forEach(ally => {
        if (char === ally) return;

        if (!this.game.effectHelper.hasEffect(ally, 'TargetSong')) {
          this.sendMessage(ally, { message: 'You hear an aria of refuge!' });
        }

        this.game.effectHelper.addEffect(ally, char, 'TargetSong', {
          effect: {
            duration: 5,
            extra: {
              hideTicks: true,
              effectIcon: 'music-spell',
              tooltipName: 'Song',
              tooltipColor: '#aa0',
              tooltip: `+${effect.effectInfo.potency} Physical/Magical Resist`,
              statChanges: {
                [Stat.PhysicalResist]: effect.effectInfo.potency,
                [Stat.MagicalResist]: effect.effectInfo.potency
              }
            }
          }
        });
      });
    }
  }

}
