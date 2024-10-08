import {
  ICharacter,
  IPlayer,
  ItemSlot,
  Skill,
  SpellCastArgs,
} from '../../../../interfaces';
import { Spell } from '../../../../models/world/Spell';

export class Succor extends Spell {
  override cast(
    caster: ICharacter | null,
    target: ICharacter | null,
    spellCastArgs: SpellCastArgs,
  ): void {
    if (!caster) return;

    const rightHand = caster?.items.equipment[ItemSlot.RightHand];
    if (rightHand) {
      this.sendMessage(caster, { message: 'You need to empty right hand!' });
      return;
    }

    const map = this.game.worldManager.getMap(caster.map)?.map;
    if (!map) return;

    if (!map.canSuccor(caster as IPlayer)) {
      return this.sendMessage(caster, { message: 'A haze clouds your mind.' });
    }

    this.sendMessage(caster, {
      message:
        'You channel your memories of this place into a ball of magical energy.',
    });

    const maxOz = Math.max(
      1,
      Math.floor(
        this.game.characterHelper.getSkillLevel(caster, Skill.Restoration) / 5,
      ),
    );

    const succorItem = this.game.itemCreator.createSuccorItem(
      caster.map,
      caster.x,
      caster.y,
      this.game.subscriptionHelper.maxSuccorOz(caster as IPlayer, maxOz),
    );

    this.game.characterHelper.setRightHand(caster, succorItem);
  }
}
