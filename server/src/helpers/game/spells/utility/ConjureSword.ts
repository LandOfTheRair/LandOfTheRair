import { ICharacter, IPlayer, ItemSlot, Skill, SpellCastArgs, Stat } from '../../../../interfaces';
import { Spell } from '../../../../models/world/Spell';

export class ConjureSword extends Spell {

  override cast(caster: ICharacter | null, target: ICharacter | null, spellCastArgs: SpellCastArgs): void {
    if (!caster) return;

    const rightHand = caster.items.equipment[ItemSlot.RightHand];
    const leftHand = caster.items.equipment[ItemSlot.LeftHand];

    if (rightHand && leftHand) {
      this.sendMessage(caster, { message: 'You need to empty a hand!' });
      return;
    }

    this.sendMessage(caster, { message: 'You channel magical energy into the form of a sword.' });

    const item = this.game.itemCreator.getSimpleItem('Conjured Longsword');

    const skill = Math.max(spellCastArgs.potency, this.game.characterHelper.getSkillLevel(caster, Skill.Conjuration) + 1);

    item.mods.destroyOnDrop = true;
    item.mods.offhand = true;
    item.mods.tier = Math.floor(skill / 4) + 1;

    item.mods.stats = {};
    item.mods.stats[Stat.WeaponArmorClass] = Math.floor(skill / 6);
    item.mods.stats[Stat.Offense] = Math.floor(skill / 4);
    item.mods.stats[Stat.Defense] = Math.floor(skill / 4);
    item.mods.stats[Stat.Accuracy] = Math.floor(skill / 5);

    this.game.itemHelper.setOwner(caster as IPlayer, item);

    if (!rightHand) {
      this.game.characterHelper.setRightHand(caster, item);
    } else if (!leftHand) {
      this.game.characterHelper.setLeftHand(caster, item);
    }

  }

}
