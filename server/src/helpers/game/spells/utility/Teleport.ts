import { ICharacter, IPlayer, SoundEffect, SpellCastArgs } from '../../../../interfaces';
import { Player } from '../../../../models';
import { Spell } from '../../../../models/world/Spell';

export class Teleport extends Spell {

  override cast(caster: ICharacter | null, target: ICharacter | null, spellCastArgs: SpellCastArgs): void {
    if (!caster) return;

    const map = this.game.worldManager.getMap(caster.map)?.map;
    if (!map) return;

    if (!map.canTeleport(caster as IPlayer)) {
      this.game.messageHelper.sendLogMessageToPlayer(caster, {
        message: 'Something distracts your focus.'
      });
      return;
    }

    const location = spellCastArgs.originalArgs?.stringArgs;
    if (!location) {
      this.game.teleportHelper.showTeleports(caster as IPlayer);
      return;
    }

    const teleportLocation = (caster as IPlayer).teleportLocations[location];
    if (!teleportLocation) {
      this.sendMessage(caster, { message: 'You do not know a location with that name!' });
      return;
    }

    this.game.characterHelper.damage(caster, caster.hp.current - 1);
    this.sendMessage(caster, { message: 'Your vision blurs as you travel through the rift.', sfx: SoundEffect.SpellSpecialTeleport });
    this.game.teleportHelper.teleport(caster as Player, teleportLocation);

  }

}
