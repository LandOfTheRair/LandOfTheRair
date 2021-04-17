import { ICharacter, IMacroCommandArgs, IPlayer } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class Shield extends SpellCommand {

  override aliases = ['shield', 'art shield'];
  override requiresLearn = true;
  override targetsFriendly = true;
  override canTargetSelf = true;
  override spellRef = 'Shield';

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return super.canUse(caster, caster)
        && !this.game.effectHelper.hasEffect(caster, 'Shield');
  }

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    this.castSpellAt(player, player, args);
  }

  override use(char: ICharacter) {
    this.castSpellAt(char, char);
  }

}
