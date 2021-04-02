import { SpellCommand } from '../../../../../../models/macro';

export class Darkness extends SpellCommand {

  aliases = ['darkness', 'cast darkness'];
  requiresLearn = true;
  spellRef = 'Darkness';
  canTargetSelf = true;

}
