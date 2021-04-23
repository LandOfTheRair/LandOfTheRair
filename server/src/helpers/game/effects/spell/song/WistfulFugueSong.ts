import { ICharacter, IStatusEffect, Skill, Stat } from '../../../../../interfaces';
import { Song } from './Song';

export class WistfulFugueSong extends Song {

  public override create(char: ICharacter, effect: IStatusEffect) {

    effect.effectInfo.potency = Math.floor(Math.max(1, this.game.characterHelper.getSkillLevel(char, Skill.Thievery) / 6));

    this.sendMessage(char, { message: 'You begin singing a wistful fugue!' });
  }

  override tick(char: ICharacter, effect: IStatusEffect) {
    super.tick(char, effect);

    if (((effect.effectInfo.currentTick ?? 0) % 5) === 0) {
      this.game.worldManager.getMapStateForCharacter(char).getAllHostilesWithoutVisibilityTo(char, 4).forEach(enemy => {

        if (!this.game.effectHelper.hasEffect(enemy, 'TargetSong')) {
          this.sendMessage(enemy, { message: 'You are hit with a wistful fugue!' });
        }

        this.game.effectHelper.addEffect(enemy, char, 'TargetSong', {
          effect: {
            duration: 5,
            extra: {
              hideTicks: true,
              effectIcon: 'music-spell',
              tooltipName: 'Song',
              tooltipColor: '#00f',
              tooltip: `-${effect.effectInfo.potency} DEX/AGI/WIL`,
              statChanges: {
                [Stat.DEX]: -effect.effectInfo.potency,
                [Stat.AGI]: -effect.effectInfo.potency,
                [Stat.WIL]: -effect.effectInfo.potency,
              }
            }
          }
        });
      });
    }
  }

}
