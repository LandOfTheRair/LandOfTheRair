import { IMacroCommandArgs, IPlayer } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class HolyFire extends SpellCommand {

  aliases = ['holyfire', 'cast holyfire'];
  requiresLearn = true;
  spellRef = 'HolyFire';

  execute(player: IPlayer, args: IMacroCommandArgs) {
    super.execute(player, args);

    this.game.commandHandler.getSkillRef('Light').execute(player, { ...args, overrideEffect: { range: 0, name: 'Light', potency: 1 } });
  }

}
