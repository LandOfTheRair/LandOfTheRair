import { ICharacter, IPlayer, ItemSlot, Skill, SpellCastArgs } from '../../../../interfaces';
import { Spell } from '../../../../models/world/Spell';

export class ConjureHealing extends Spell {

  cast(caster: ICharacter | null, target: ICharacter | null, spellCastArgs: SpellCastArgs): void {
    if (!caster) return;

    const rightHand = caster?.items.equipment[ItemSlot.RightHand];
    if (rightHand) {
      this.sendMessage(caster, { message: 'You need to empty right hand!' });
      return;
    }

    this.sendMessage(caster, { message: 'You channel magical energy into a bottle.' });

    const healingItem = this.game.itemCreator.getSimpleItem('Conjured Healing Potion');

    const skill = this.game.characterHelper.getSkillLevel(caster, Skill.Conjuration) + 1;

    healingItem.mods.ounces = skill;
    healingItem.mods.useEffect = { name: 'ExactHeal', potency: skill * 25 };
    healingItem.mods.destroyOnDrop = true;

    this.game.itemHelper.setOwner(caster as IPlayer, healingItem);

    this.game.characterHelper.setRightHand(caster, healingItem);

  }

}
