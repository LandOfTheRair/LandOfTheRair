import { ICharacter, IMacroCommandArgs, IPlayer, ItemSlot } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class RageStance extends SpellCommand {

  override aliases = ['ragestance', 'art ragestance'];
  override requiresLearn = true;
  override targetsFriendly = true;
  override canTargetSelf = true;
  override spellRef = 'RageStance';

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return super.canUse(caster, target) && !caster.effects.outgoing.length && !!caster.items.equipment[ItemSlot.RightHand];
  }

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    if (!player.items.equipment[ItemSlot.RightHand]) return this.sendMessage(player, 'You need a weapon in your hands to take a stance!');

    this.castSpellAt(player, player, args);
  }

  override use(char: ICharacter) {
    this.castSpellAt(char, char);
  }

}
