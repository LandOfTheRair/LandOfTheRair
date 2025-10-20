import { SpellCommand } from '@lotr/core';

export class Wellspring extends SpellCommand {
  override aliases = ['wellspring', 'cast wellspring'];
  override requiresLearn = true;
  override spellRef = 'Wellspring';
  override canTargetSelf = true;
}
