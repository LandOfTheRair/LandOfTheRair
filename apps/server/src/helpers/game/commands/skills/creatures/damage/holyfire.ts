import type { IMacroCommandArgs, IPlayer } from '@lotr/interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class HolyFire extends SpellCommand {
  override aliases = ['holyfire', 'cast holyfire'];
  override requiresLearn = true;
  override canTargetSelf = true;
  override spellRef = 'HolyFire';

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    const res = super.execute(player, args);

    if (res) {
      this.game.commandHandler
        .getSkillRef('Light')
        .execute(player, {
          ...args,
          overrideEffect: { range: 0, name: 'Light', potency: 1 },
        });
    }
  }
}
