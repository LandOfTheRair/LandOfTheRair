import { ICharacter, IPlayer, ItemClass, ItemSlot, Skill, SpellCastArgs, Stat, WeaponClass, WeaponClasses } from '../../../../interfaces';
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

    const weaponType = spellCastArgs.originalArgs?.stringArgs ?? 'Longsword';

    const item = this.game.itemCreator.getSimpleItem(`Conjured ${weaponType}`);
    const { itemClass, twoHanded, canShoot } = this.game.itemHelper.getItemProperties(item, ['itemClass', 'twoHanded', 'canShoot']);
    if (!item || !WeaponClasses.includes(itemClass as WeaponClass) || itemClass === ItemClass.Shield) {
      this.sendMessage(caster, { message: 'The ether churns at your request.' });
      return;
    }

    this.sendMessage(caster, { message: `You channel the ether into the form of a ${weaponType.toLowerCase()}.` });
    console.log(item);

    const skill = Math.max(spellCastArgs.potency, this.game.characterHelper.getSkillLevel(caster, Skill.Conjuration) + 1);

    item.mods.destroyOnDrop = true;
    item.mods.tier = Math.floor(skill / 4) + 1;

    if (!twoHanded && !canShoot) {
      item.mods.offhand = true;
    }

    item.mods.stats = {};
    item.mods.stats[Stat.WeaponArmorClass] = Math.floor(skill / 6);
    item.mods.stats[Stat.Offense] = Math.floor(skill / 4);
    item.mods.stats[Stat.Defense] = Math.floor(skill / 4);
    item.mods.stats[Stat.Accuracy] = Math.floor(skill / 5);

    if (twoHanded) {
      item.mods.stats[Stat.WeaponArmorClass] = Math.floor(skill / 5);
      item.mods.stats[Stat.Accuracy] = Math.floor(skill / 7);
      item.mods.stats[Stat.Offense] = Math.floor(skill / 3);
      item.mods.stats[Stat.Defense] = Math.floor(skill / 5);
    }

    if (canShoot) {
      item.mods.stats[Stat.Defense] = 0;
      item.mods.stats[Stat.Accuracy] = Math.floor(skill / 4);
    }

    this.game.itemHelper.setOwner(caster as IPlayer, item);

    if (!rightHand) {
      this.game.characterHelper.setRightHand(caster, item);
    } else if (!leftHand) {
      this.game.characterHelper.setLeftHand(caster, item);
    }

  }

}
