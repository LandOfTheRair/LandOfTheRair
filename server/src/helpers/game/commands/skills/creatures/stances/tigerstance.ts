import { ICharacter, IMacroCommandArgs, IPlayer, ItemSlot } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class TigerStance extends SpellCommand {

  override aliases = ['tigerstance', 'art tigerstance'];
  override requiresLearn = true;
  override targetsFriendly = true;
  override canTargetSelf = true;
  override spellRef = 'TigerStance';

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return super.canUse(caster, target) && !caster.effects.incoming.length && !caster.items.equipment[ItemSlot.RightHand];
  }

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    if (player.items.equipment[ItemSlot.RightHand]) return this.sendMessage(player, 'You need an empty right hand to take a stance!');

    this.castSpellAt(player, player, args);
  }

  override use(char: ICharacter) {
    this.castSpellAt(char, char);
  }

}
