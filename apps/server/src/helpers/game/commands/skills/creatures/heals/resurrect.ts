import type { ICharacter, IMacroCommandArgs, IPlayer } from '@lotr/interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class Resurrect extends SpellCommand {
  override aliases = ['resurrect', 'cast resurrect'];
  override requiresLearn = true;
  override targetsFriendly = true;
  override canTargetSelf = true;
  override spellRef = 'Resurrect';

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return false;
  }

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    args.stringArgs = player.name;
    super.execute(player, args);
  }
}
