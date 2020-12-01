import { ICharacter, IStatusEffect, Stat } from '../../../../interfaces';
import { Effect } from '../../../../models';

export class Hidden extends Effect {

  create(char: ICharacter, effect: IStatusEffect) {
    effect.effectInfo.potency = this.game.characterHelper.getStealth(char);
    effect.effectInfo.statChanges = { [Stat.Stealth]: effect.effectInfo.potency };
  }

  // update everyone in sight so they can't see us (maybe)
  apply(char: ICharacter) {
    const { state } = this.game.worldManager.getMap(char.map);
    state.triggerPlayerUpdateInRadius(char.x, char.y);
  }

  tick(char: ICharacter) {
    if (this.game.visibilityHelper.canContinueHidingAtSpot(char)) return;

    this.game.effectHelper.removeEffectByName(char, 'Hidden');
  }

  // update everyone in sight so they can see us again (if they couldn't before)
  unapply(char: ICharacter) {
    const { state } = this.game.worldManager.getMap(char.map);
    state.triggerPlayerUpdateInRadius(char.x, char.y);
  }

}
