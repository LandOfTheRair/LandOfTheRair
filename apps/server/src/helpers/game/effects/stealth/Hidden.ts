import { isPlayer, mana, manaDamage, stealthGet } from '@lotr/characters';
import { settingClassConfigGet, traitLevelValue } from '@lotr/content';
import { worldGetMapAndState } from '@lotr/core';
import type { ICharacter, IPlayer, IStatusEffect } from '@lotr/interfaces';
import { Skill, Stat } from '@lotr/interfaces';
import { Effect } from '../../../../models';

export class Hidden extends Effect {
  private breakHide(char: ICharacter) {
    this.game.effectHelper.removeEffectByName(char, 'Hidden');
  }

  override create(char: ICharacter, effect: IStatusEffect) {
    effect.effectInfo.potency = stealthGet(char);
    effect.effectInfo.statChanges = {
      [Stat.Stealth]: effect.effectInfo.potency,
    };

    const mult = traitLevelValue(char, 'HiddenHealing');
    effect.effectInfo.statChanges[Stat.HPRegen] = Math.floor(
      effect.effectInfo.potency * mult,
    );
  }

  // update everyone in sight so they can't see us (maybe)
  override apply(char: ICharacter) {
    const state = worldGetMapAndState(char.map)?.state;
    if (!state) return;

    state.triggerPlayerUpdateInRadius(char.x, char.y);
  }

  override tick(char: ICharacter, effect: IStatusEffect) {
    super.tick(char, effect);

    const requiresMPToHide = settingClassConfigGet<'requiresMPToHide'>(
      char.baseClass,
      'requiresMPToHide',
    );

    // thieves have to use their stealth bar
    if (requiresMPToHide) {
      const state = worldGetMapAndState(char.map)?.state;
      if (!state) return;

      // tick operates on mp5
      if ((effect.effectInfo.currentTick ?? 0) % 5 === 0) {
        const numHostile = state.getAllHostilesWithoutVisibilityToInFOV(
          char,
          4,
        );

        if (numHostile.length === 0) {
          mana(char, 1);
          return;
        }

        const hostileReduction = traitLevelValue(char, 'ImprovedHide');

        const hostileStealthLoss = numHostile.length * 2;

        const totalReduction = Math.max(
          1,
          hostileStealthLoss - hostileReduction,
        );

        if (isPlayer(char)) {
          this.game.playerHelper.tryGainSkill(
            char as IPlayer,
            Skill.Thievery,
            1,
          );
        }

        manaDamage(char, totalReduction);

        if (char.mp.current <= 0) {
          this.breakHide(char);
        }
      }
    }

    if (this.game.visibilityHelper.canContinueHidingAtSpot(char)) return;

    this.breakHide(char);
  }

  // update everyone in sight so they can see us again (if they couldn't before)
  override unapply(char: ICharacter) {
    const state = worldGetMapAndState(char.map)?.state;
    if (!state) return;

    state.triggerPlayerUpdateInRadius(char.x, char.y);
  }
}
