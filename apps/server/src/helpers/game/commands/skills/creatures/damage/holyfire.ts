import { SpellCommand } from '@lotr/core';
import type { ICharacter, IMacroCommandArgs, IPlayer } from '@lotr/interfaces';

export class HolyFire extends SpellCommand {
  override aliases = ['holyfire', 'cast holyfire'];
  override requiresLearn = true;
  override canTargetSelf = true;
  override spellRef = 'HolyFire';

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    if (!args.stringArgs) return false;

    const target = this.game.targettingHelper.getFirstPossibleTargetInViewRange(
      player,
      args.stringArgs,
    );
    if (!target) return this.youDontSeeThatPerson(player, args.stringArgs);

    if (target === player) return;

    this.use(player, target);
  }

  override use(caster: ICharacter, target: ICharacter): void {
    super.use(caster, target);

    this.game.commandHandler.getSkillRef('Light').execute(caster, {
      overrideEffect: { range: 0, name: 'Light', potency: 1 },
    });
  }
}
