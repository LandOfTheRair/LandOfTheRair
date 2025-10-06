import type { IMacroCommandArgs, IPlayer } from '@lotr/interfaces';
import { MacroCommand } from '../../../../models/macro';

export class GMSpellMod extends MacroCommand {
  override aliases = ['@spellmod', '@sm'];
  override isGMCommand = true;
  override canBeInstant = false;
  override canBeFast = false;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    if (!args.stringArgs) {
      this.sendMessage(player, 'Syntax: SpellName|"list" [PotencyModifier]');
      return;
    }

    const [name, potency] = args.arrayArgs;
    if (!name) {
return this.sendMessage(
        player,
        'You must specify a spell name or "list".',
      );
}

    if (name === 'list') {
      const allOverrides = this.game.worldDB.getAllSpellMultiplierOverrides();

      this.sendMessage(player, 'Spell potency OVERRIDE modifiers:');
      Object.keys(allOverrides).forEach((spell) => {
        this.sendMessage(
          player,
          `* ${spell}: ${allOverrides[spell]} (${allOverrides[spell] * 100}%)`,
        );
      });
      return;
    }

    const setPotency = potency ? +potency : 0;

    this.game.worldDB.setSpellMultiplierOverride(name, setPotency);

    this.sendMessage(
      player,
      `${name} spell potency set to ${setPotency === 0 ? 'default' : setPotency * 100 + '%'}.`,
    );
  }
}
