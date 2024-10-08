import { ICharacter, IMacroCommandArgs, IPlayer, ItemSlot } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class ParryStance extends SpellCommand {

  override aliases = ['parrystance', 'art parrystance'];
  override requiresLearn = true;
  override targetsFriendly = true;
  override canTargetSelf = true;
  override spellRef = 'ParryStance';

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return super.canUse(caster, target)
        && !caster.effects.incoming.length
        && !this.game.effectHelper.hasEffect(caster, 'RageStance')
        && !!caster.items.equipment[ItemSlot.RightHand];
  }

  override execute(player: IPlayer, args: IMacroCommandArgs) {

    if (this.game.effectHelper.hasEffect(player, 'ParryStance')) {
      this.game.effectHelper.removeEffectByName(player, 'ParryStance');
      this.sendMessage(player, 'You return to a normal stance.');
      return;
    }

    if (!player.items.equipment[ItemSlot.RightHand]) return this.sendMessage(player, 'You need a weapon in your hands to take a stance!');

    this.castSpellAt(player, player, args);
  }

  override use(char: ICharacter) {
    this.castSpellAt(char, char);
  }

}
