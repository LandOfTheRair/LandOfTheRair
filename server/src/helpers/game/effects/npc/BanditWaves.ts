import { ICharacter, IStatusEffect } from '../../../../interfaces';
import { Effect } from '../../../../models';

export class BanditWaves extends Effect {
  override tick(char: ICharacter, effect: IStatusEffect) {
    super.tick(char, effect);

    const mapState = this.game.worldManager.getMapStateForCharacter(char);
    if (!mapState) return;

    mapState.allPlayers.forEach((p) => {
      if (!this.game.effectHelper.hasEffect(p, 'BanditWavesPlayerInfo')) {
        this.game.effectHelper.addEffect(p, char, 'BanditWavesPlayerInfo', {
          effect: {
            duration: 1800,
          },
        });
      }

      const playerEffect = this.game.effectHelper.getEffect(
        p,
        'BanditWavesPlayerInfo',
      );
      if (playerEffect) {
        playerEffect.tooltip = 'Fighting bandits!';
      }
    });

    // TODO: spread info to all players every tick in the zone
    // TODO: if a player doesn't have it, give it to them
  }
}
