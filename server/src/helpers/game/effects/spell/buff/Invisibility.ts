import { ICharacter, IStatusEffect, Stat } from '../../../../../interfaces';
import { Effect } from '../../../../../models';

export class Invisibility extends Effect {

  public override create(char: ICharacter, effect: IStatusEffect) {
    effect.effectInfo.statChanges = { [Stat.Stealth]: 1 };
  }

  // update everyone in sight so they can't see us (maybe)
  override apply(char: ICharacter) {
    const state = this.game.worldManager.getMap(char.map)?.state;
    if (!state) return;

    state.triggerPlayerUpdateInRadius(char.x, char.y);
  }

  // update everyone in sight so they can see us again (if they couldn't before)
  override unapply(char: ICharacter) {
    const state = this.game.worldManager.getMap(char.map)?.state;
    if (!state) return;

    state.triggerPlayerUpdateInRadius(char.x, char.y);
  }

}
