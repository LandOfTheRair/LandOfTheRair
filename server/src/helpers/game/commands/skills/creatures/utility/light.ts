import { SpellCommand } from '../../../../../../models/macro';

export class Light extends SpellCommand {

  aliases = ['light', 'cast light'];
  requiresLearn = true;
  spellRef = 'Light';
  canTargetSelf = true;

}
