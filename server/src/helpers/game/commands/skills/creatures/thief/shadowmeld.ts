import { ICharacter, IMacroCommandArgs, IPlayer } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class Shadowmeld extends SpellCommand {

  override aliases = ['shadowmeld', 'cast shadowmeld'];
  override requiresLearn = true;
  override targetsFriendly = true;
  override canTargetSelf = true;
  override spellRef = 'Shadowmeld';

  override canUse(caster: ICharacter): boolean {
    return super.canUse(caster, caster) && !this.game.effectHelper.hasEffect(caster, 'Shadowmeld');
  }

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    this.castSpellAt(player, player, args);
  }

  override use(char: ICharacter) {
    this.castSpellAt(char, char);
  }

}
