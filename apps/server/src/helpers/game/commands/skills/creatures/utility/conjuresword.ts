import type {
  ICharacter,
  IDialogChatAction,
  IMacroCommandArgs,
  IPlayer,
  WeaponClass } from '@lotr/interfaces';
import {
  GameServerResponse,
  ItemClass,
  ItemSlot,
  WeaponClasses,
} from '@lotr/interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class ConjureSword extends SpellCommand {
  override aliases = ['conjuresword', 'cast conjuresword'];
  override requiresLearn = true;
  override spellRef = 'ConjureSword';
  override canTargetSelf = true;

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return (
      super.canUse(caster, caster) &&
      (!caster.items.equipment[ItemSlot.LeftHand] ||
        !caster.items.equipment[ItemSlot.RightHand])
    );
  }

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    if (!args.stringArgs) {
      const options = [{ text: 'Nevermind', action: 'noop' }];

      let msg = 'Choose a weapon:';

      const weaponChoices =
        this.game.contentManager.getItemsMatchingName('Conjured');
      weaponChoices.forEach((weapon, i) => {
        if (!WeaponClasses.includes(weapon.itemClass as WeaponClass)) return;
        if (weapon.itemClass === ItemClass.Shield) return;

        const weaponName = weapon.name.split(' ')[1];
        msg = `${msg}<br>${i + 1}: ${weaponName}`;
        options.push({
          text: `${weaponName}`,
          action: `cast conjuresword ${weaponName}`,
        });
      });

      this.game.messageHelper.sendLogMessageToPlayer(player, { message: msg });

      const formattedChat: IDialogChatAction = {
        message: 'Create which weapon?',
        displayTitle: 'Conjure Weapon',
        options,
      };

      this.game.transmissionHelper.sendResponseToAccount(
        player.username,
        GameServerResponse.DialogChat,
        formattedChat,
      );

      return;
    }

    this.castSpellAt(player, player, args);
  }

  override use(char: ICharacter) {
    this.castSpellAt(char, char);
  }
}
