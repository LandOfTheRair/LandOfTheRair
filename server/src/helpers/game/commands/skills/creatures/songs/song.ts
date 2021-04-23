import { ICharacter, IMacroCommandArgs, IPlayer } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class Song extends SpellCommand {

  override aliases = [''];
  override requiresLearn = true;
  override canTargetSelf = true;
  override targetsFriendly = true;
  override spellRef = 'Song';

  override range(): number {
    return 0;
  }

  override canUse(char: ICharacter): boolean {
    return !this.game.effectHelper.hasEffect(char, 'Song');
  }

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    this.castSpellAt(player, player, args);
  }

  override use(char: ICharacter) {
    this.castSpellAt(char, char);
  }

}
