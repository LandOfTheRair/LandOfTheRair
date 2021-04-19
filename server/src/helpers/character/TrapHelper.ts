
import { Injectable } from 'injection-js';

import { ICharacter, IGroundItem, IItemEffect, ISimpleItem, ItemClass, Skill } from '../../interfaces';
import { BaseService } from '../../models/BaseService';

@Injectable()
export class TrapHelper extends BaseService {

  public init() {}

  public canPlaceTrap(map: string, x: number, y: number): boolean {
    return !this.getTrapAt(map, x, y);
  }

  public getTrapAt(map: string, x: number, y: number): IGroundItem {
    return this.game.groundManager.getItemsFromGround(map, x, y, ItemClass.TrapSet)[0];
  }

  public triggerTrap(target: ICharacter, trap: IGroundItem) {
    if (trap.item.mods.trapSetBy === target.uuid) return;

    this.game.messageHelper.sendLogMessageToPlayer(target, { message: 'You triggered a trap!' });
    this.castEffectFromTrap(target, trap);

    const trapUses = trap.item.mods.trapUses ?? 1;
    if (trapUses > 0) {
      this.game.itemHelper.setItemProperty(trap.item, 'trapUses', trapUses - 1);
      if (trapUses - 1 <= 0) this.removeTrap(target.map, target.x, target.y, trap);
    }
  }

  public castEffectFromTrap(target: ICharacter, trap: IGroundItem) {
    const trapEffect: IItemEffect = this.game.itemHelper.getItemProperty(trap.item, 'trapEffect');
    if (!trapEffect) return;

    const mapState = this.game.worldManager.getMap(target.map).state;
    const caster = mapState.getCharacterByUUID(trap.item.mods.trapSetBy ?? '');

    this.game.spellManager.castSpell(trapEffect.name, caster, target, trapEffect);
  }

  public placeTrap(x: number, y: number, placer: ICharacter, trap: ISimpleItem) {
    trap = this.game.itemCreator.rerollItem(trap);
    trap.mods.itemClass = ItemClass.TrapSet;
    trap.mods.trapSetBy = placer.uuid;
    trap.mods.trapSetSkill = this.game.characterHelper.getSkillLevel(placer, Skill.Thievery);
    trap.mods.trapUses = 1;

    this.setTrap(placer.map, x, y, trap);
  }

  public canDisarmTrap(user: ICharacter, trap: ISimpleItem): boolean {
    return this.game.characterHelper.getSkillLevel(user, Skill.Thievery) > (trap.mods.trapSetSkill ?? 1);
  }

  private setTrap(map: string, x: number, y: number, trap: ISimpleItem) {
    this.game.worldManager.getMap(map).state.addItemToGround(x, y, trap);
  }

  public removeTrap(map: string, x: number, y: number, trap: IGroundItem) {
    this.game.worldManager.getMap(map).state.removeItemsFromGround(x, y, [trap]);
  }

}
