import { ICharacter, IPlayer, ItemSlot, Skill, SpellCastArgs, Stat } from '../../../../interfaces';
import { Spell } from '../../../../models/world/Spell';

export class ConjureShield extends Spell {

  override cast(caster: ICharacter | null, target: ICharacter | null, spellCastArgs: SpellCastArgs): void {
    if (!caster) return;

    const leftHand = caster.items.equipment[ItemSlot.LeftHand];
    if (leftHand) {
      this.sendMessage(caster, { message: 'You need to empty your left hand!' });
      return;
    }

    this.sendMessage(caster, { message: 'You channel magical energy into the form of a shield.' });

    const item = this.game.itemCreator.getSimpleItem('Conjured Shield');

    const skill = Math.max(spellCastArgs.potency, this.game.characterHelper.getSkillLevel(caster, Skill.Conjuration) + 1);

    item.mods.destroyOnDrop = true;
    item.mods.tier = Math.floor(skill / 4);

    item.mods.stats = {};
    item.mods.stats[Stat.ArmorClass] = skill;
    item.mods.stats[Stat.Defense] = Math.floor(skill / 2);
    item.mods.stats[Stat.MagicalResist] = skill * 2;
    item.mods.stats[Stat.PhysicalResist] = skill * 2;

    this.game.itemHelper.setOwner(caster as IPlayer, item);

    this.game.characterHelper.setLeftHand(caster, item);

  }

}
