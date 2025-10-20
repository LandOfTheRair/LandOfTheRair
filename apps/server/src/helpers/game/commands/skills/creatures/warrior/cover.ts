import { SpellCommand } from '@lotr/core';
import { hasEffect } from '@lotr/effects';
import type { ICharacter, IMacroCommandArgs, IPlayer } from '@lotr/interfaces';

export class Cover extends SpellCommand {
  override aliases = ['art cover'];
  override requiresLearn = true;
  override targetsFriendly = true;
  override canTargetSelf = true;
  override spellRef = 'Cover';

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return false;
  }

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    const target = this.game.targettingHelper.getFirstPossibleTargetInViewRange(
      player as IPlayer,
      args.stringArgs,
    );

    if (!target) {
      return this.youDontSeeThatPerson(player as IPlayer, args.stringArgs);
    }

    if (this.game.targettingHelper.checkTargetForHostility(player, target)) {
      return this.sendMessage(player, "You can't cover an enemy!");
    }

    if (target === player) {
      return this.sendMessage(player, "You can't cover yourself!");
    }

    if (hasEffect(target, 'Covered')) {
      return this.sendMessage(
        player,
        'That person is being covered by someone else!',
      );
    }

    if (hasEffect(target, 'Cover')) {
      return this.sendMessage(player, 'That person is covering someone else!');
    }

    if (hasEffect(player, 'Cover')) {
      return this.sendMessage(player, 'You are already covering someone!');
    }

    this.use(player, target);
  }

  override use(user: ICharacter, target: ICharacter): void {
    this.castSpellAt(user, user, {
      stringArgs: target.uuid,
    });
  }
}
