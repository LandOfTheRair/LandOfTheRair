import { SkillCommand } from '@lotr/core';
import { hasEffect } from '@lotr/effects';
import type { ICharacter } from '@lotr/interfaces';

export class Reveal extends SkillCommand {
  override aliases = ['reveal'];
  override canBeInstant = false;
  override canBeFast = false;

  override execute(char: ICharacter) {
    this.use(char);
  }

  override use(char: ICharacter) {
    if (!hasEffect(char, 'Hidden') && !hasEffect(char, 'Shadowmeld')) {
      this.sendMessage(char, 'You are not hidden!');
      return;
    }

    this.game.effectHelper.removeEffectByName(char, 'Hidden');
    this.game.effectHelper.removeEffectByName(char, 'Shadowmeld');
  }
}
