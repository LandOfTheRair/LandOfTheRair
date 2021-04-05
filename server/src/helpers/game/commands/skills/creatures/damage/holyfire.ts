import { IMacroCommandArgs, IPlayer } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class HolyFire extends SpellCommand {

  override aliases = ['holyfire', 'cast holyfire'];
  override requiresLearn = true;
  override spellRef = 'HolyFire';

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    super.execute(player, args);

    this.game.commandHandler.getSkillRef('Light').execute(player, { ...args, overrideEffect: { range: 0, name: 'Light', potency: 1 } });
  }

}
