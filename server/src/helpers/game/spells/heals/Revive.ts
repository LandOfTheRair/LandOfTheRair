import { ICharacter, ItemClass, SpellCastArgs, Stat } from '../../../../interfaces';
import { Spell } from '../../../../models/world/Spell';

export class Revive extends Spell {

  override cast(caster: ICharacter | null, target: ICharacter | null, spellCastArgs: SpellCastArgs): void {
    if (!caster) return;

    let didRevive = false;

    const corpses = this.game.groundManager.getItemsFromGround(caster.map, caster.x, caster.y, ItemClass.Corpse);
    corpses.forEach(corpse => {
      if (!corpse.item.mods.corpseUsername || didRevive) return;

      const player = this.game.playerManager.getPlayerByUsername(corpse.item.mods.corpseUsername);
      if (!player) return;

      this.game.messageHelper.sendSimpleMessage(player, `${caster.name} revived you!`);
      this.game.messageHelper.sendSimpleMessage(caster, `You revived ${player.name}!`);

      this.game.deathHelper.restore(player, { map: caster.map, x: caster.x, y: caster.y });
      this.game.characterHelper.gainPermanentStat(player, Stat.CON, 1);

      didRevive = true;

      this.game.effectHelper.addEffect(player, '', 'EtherSickness');

      if (this.game.traitHelper.traitLevel(caster, 'SnapHeal') && this.game.traitHelper.traitLevel(caster, 'Cure')) {
        this.game.commandHandler.getSkillRef('Cure').use(caster, player);
      }

      this.game.playerHelper.refreshPlayerMapState(player);
    });

    if (!didRevive) {
      this.game.messageHelper.sendSimpleMessage(caster, 'There are no corpses here to revive.');
    }
  }

}
