import { SpellCommand } from '@lotr/core';
import type { ICharacter, IMacroCommandArgs, IPlayer } from '@lotr/interfaces';
import { SoundEffect } from '@lotr/interfaces';

export class Lightning extends SpellCommand {
  override aliases = ['lightning', 'cast lightning'];

  override requiresLearn = true;
  override canTargetSelf = true;
  override spellRef = 'Lightning';

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

  override use(user: ICharacter, target: ICharacter): void {
    this.game.messageHelper.sendLogMessageToRadius(target, 8, {
      message: 'You hear the crackling of lightning.',
      sfx: SoundEffect.SpellAOELightning,
    });

    super.use(user, target, undefined, {
      x: target.x,
      y: target.y,
      map: target.map,
    });
  }
}
