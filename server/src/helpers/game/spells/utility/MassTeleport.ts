import { ICharacter, IPlayer, SoundEffect, SpellCastArgs } from '../../../../interfaces';
import { Player } from '../../../../models';
import { Spell } from '../../../../models/world/Spell';

export class MassTeleport extends Spell {

  override cast(caster: ICharacter | null, target: ICharacter | null, spellCastArgs: SpellCastArgs): void {
    if (!caster) return;

    const mapData = this.game.worldManager.getMap(caster.map);
    if (!mapData) return;

    const { map, state } = mapData;

    if (!map.canTeleport(caster as IPlayer)) {
      this.game.messageHelper.sendLogMessageToPlayer(caster, {
        message: 'Something distracts your focus.'
      });
      return;
    }

    const location = spellCastArgs.originalArgs?.stringArgs;
    if (!location) {
      this.game.teleportHelper.showTeleports(caster as IPlayer, 'massteleport');
      return;
    }

    const teleportLocation = (caster as IPlayer).teleportLocations[location];
    if (!teleportLocation) {
      this.sendMessage(caster, { message: 'You do not know a location with that name!' });
      return;
    }

    this.game.characterHelper.damage(caster, caster.hp.current - 1);

    state.getPlayersInRange(caster, 0).forEach(teleportedTarget => {
      this.sendMessage(teleportedTarget, {
        message: 'Your vision blurs as you travel through the rift.', sfx: SoundEffect.SpellSpecialTeleport
      });
      this.game.teleportHelper.teleport(teleportedTarget as Player, teleportLocation);
    });
  }

}
