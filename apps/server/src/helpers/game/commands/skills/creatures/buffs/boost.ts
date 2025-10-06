import type { ICharacter, IMacroCommandArgs, IPlayer } from '@lotr/interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class Boost extends SpellCommand {
  override aliases = ['boost', 'art boost'];
  override requiresLearn = true;
  override targetsFriendly = true;
  override canTargetSelf = true;
  override spellRef = 'Boost';

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return (
      super.canUse(caster, caster) &&
      !this.game.effectHelper.hasEffect(caster, 'Boost')
    );
  }

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    this.castSpellAt(player, player, args);
  }

  override use(char: ICharacter) {
    this.castSpellAt(char, char);
  }
}
