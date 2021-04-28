import { ICharacter, IMacroCommandArgs, IPlayer } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class FindFamiliar extends SpellCommand {

  override aliases = [''];
  override requiresLearn = true;
  override spellRef = 'FindFamiliar';

  override range(): number {
    return 0;
  }

  override canUse(char: ICharacter): boolean {
    return !this.game.effectHelper.hasEffect(char, 'FindFamiliar');
  }

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    this.game.effectHelper.removeEffectByName(player, 'FindFamiliar');
    this.castSpellAt(player, player, args);
  }

  override use(char: ICharacter) {
    this.game.effectHelper.removeEffectByName(char, 'FindFamiliar');
    this.castSpellAt(char, char);
  }

}
