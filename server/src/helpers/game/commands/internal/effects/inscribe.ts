
import { IMacroCommandArgs, IPlayer } from '../../../../../interfaces';
import { MacroCommand } from '../../../../../models/macro';

export class InscribeCommand extends MacroCommand {

  aliases = ['inscribe'];

  execute(player: IPlayer, args: IMacroCommandArgs) {

    if (player.combatTicks > 0) {
      this.sendMessage(player, 'You cannot inscribe in combat!');
      return;
    }

    const [slot, ...scroll] = args.arrayArgs;

    const slotNum = +slot;
    const scrollName = scroll.join(' ');

    const levelReq = 5 + (5 * slotNum);
    if (player.level < levelReq) {
      this.sendMessage(player, 'You are not high enough level to do that!');
      return;
    }

    if (player.runes.includes(scrollName)) {
      this.sendMessage(player, 'You cannot inscribe the same rune twice!');
      return;
    }

    player.runes[slotNum] = scrollName;

    this.game.characterHelper.recalculateEverything(player);
  }

}
