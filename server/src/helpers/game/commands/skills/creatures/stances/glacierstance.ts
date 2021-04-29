import { ICharacter, IMacroCommandArgs, IPlayer } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class GlacierStance extends SpellCommand {

  override aliases = ['glacierstance', 'cast glacierstance'];
  override requiresLearn = true;
  override targetsFriendly = true;
  override canTargetSelf = true;
  override spellRef = 'GlacierStance';

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return super.canUse(caster, target) && !caster.effects.incoming.length;
  }

  override execute(player: IPlayer, args: IMacroCommandArgs) {

    if (this.game.effectHelper.hasEffect(player, 'GlacierStance')) {
      this.game.effectHelper.removeEffectByName(player, 'GlacierStance');
      return;
    }

    this.castSpellAt(player, player, args);
  }

  override use(char: ICharacter) {
    this.castSpellAt(char, char);
  }

}
