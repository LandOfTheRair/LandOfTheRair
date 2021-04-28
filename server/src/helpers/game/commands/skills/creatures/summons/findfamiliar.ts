import { ICharacter, IMacroCommandArgs, IPlayer } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class FindFamiliar extends SpellCommand {

  override aliases = [''];
  override requiresLearn = true;
  override targetsFriendly = true;
  override spellRef = 'FindFamiliar';

  override range(): number {
    return 0;
  }

  override canUse(char: ICharacter): boolean {
    return !this.game.effectHelper.hasEffect(char, 'FindFamiliar') && !char.spellChannel;
  }

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    this.game.effectHelper.removeEffectByName(player, 'FindFamiliar');
    this.castSpellAt(player, player, args);
  }

  override use(char: ICharacter) {
    this.castSpellAt(char, char);
  }

}
