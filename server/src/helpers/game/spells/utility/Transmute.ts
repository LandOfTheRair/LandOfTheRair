import { ICharacter, Skill, SpellCastArgs } from '../../../../interfaces';
import { Spell } from '../../../../models/world/Spell';

export class Transmute extends Spell {

  override getPotency(caster: ICharacter | null) {
    return caster ? this.game.characterHelper.getSkillLevel(caster, Skill.Thievery) + 30 : 10;
  }

  override cast(caster: ICharacter | null, target: ICharacter | null, spellCastArgs: SpellCastArgs): void {
    const center = target ? target : { x: spellCastArgs.x ?? 0, y: spellCastArgs.y ?? 0, map: spellCastArgs.map ?? '' };
    const potency = spellCastArgs.potency;

    const mapData = this.game.worldManager.getMap(center.map);
    if (!mapData) return;

    const totalGold = 0;
    const items = mapData.state.getEntireGround(center.x, center.y);
    console.log(items);

    console.log(totalGold);
  }

}
