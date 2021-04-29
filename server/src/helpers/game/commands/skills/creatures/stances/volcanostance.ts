import { ICharacter, IMacroCommandArgs, IPlayer } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class VolcanoStance extends SpellCommand {

  override aliases = ['volcanostance', 'cast volcanostance'];
  override requiresLearn = true;
  override targetsFriendly = true;
  override canTargetSelf = true;
  override spellRef = 'VolcanoStance';

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return super.canUse(caster, target) && !caster.effects.outgoing.length;
  }

  override execute(player: IPlayer, args: IMacroCommandArgs) {

    if (this.game.effectHelper.hasEffect(player, 'VolcanoStance')) {
      this.game.effectHelper.removeEffectByName(player, 'VolcanoStance');
      return;
    }

    this.castSpellAt(player, player, args);
  }

  override use(char: ICharacter) {
    this.castSpellAt(char, char);
  }

}
