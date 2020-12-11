import { Game } from '../../helpers';
import { BaseClass, Direction, ICharacter, IItemEffect,
  IMacroCommand, IMacroCommandArgs, IPlayer, ItemSlot, MessageType, SoundEffect } from '../../interfaces';

export abstract class MacroCommand implements IMacroCommand {

  abstract aliases: string[];   // the aliases representing this command
  canBeInstant = false;         // whether the command can happen immediately (ie, UI-related functions)
  canBeFast = false;            // whether the command can happen on the 'fast' cycle (used for 'faster' commands outside the round timer)
  isGMCommand = false;          // whether or not the command is GM-only
  requiresLearn = false;        // whether or not the command must be learned first
  canUseWhileDead = false;      // whether or not the command can be used while dead

  constructor(protected game: Game) {}

  protected sendMessage(character: ICharacter, message: string, sfx?: SoundEffect): void {
    this.game.messageHelper.sendSimpleMessage(character, message, sfx);
  }

  protected sendChatMessage(character: ICharacter, message: string, sfx?: SoundEffect): void {
    this.game.messageHelper.sendLogMessageToPlayer(character, { message, sfx }, [MessageType.PlayerChat]);
  }

  protected youDontSeeThatPerson(character: ICharacter) {
    this.game.messageHelper.sendLogMessageToPlayer(character, { message: 'You don\'t see that person.', setTarget: null });
  }

  execute(executor: IPlayer, args: IMacroCommandArgs): void {}        // always used only by people who can execute commands (players)
  use(executor: ICharacter, target: ICharacter, opts?: any): void {}  // used by anyone who has access to the command (players, npcs)
}

export abstract class SkillCommand extends MacroCommand {

  mpCost(caster?: ICharacter, targets?: ICharacter[], overrideEffect?: Partial<IItemEffect>) { return 0; }
  hpCost(caster?: ICharacter) { return 0; }
  range(caster?: ICharacter) { return 0; }

  // whether or not we can use the skill
  canUse(user: ICharacter, target: ICharacter): boolean {
    if (user.mp.current < this.mpCost(user)) return false;
    if (user.hp.current < this.hpCost(user)) return false;
    if (this.game.directionHelper.distFrom(user, target) > this.range(user)) return false;
    return true;
  }

  // try to consume the mp (returning false if we fail)
  tryToConsumeMP(user: ICharacter, targets?: ICharacter[], overrideEffect?: Partial<IItemEffect>): boolean {

    if (this.game.diceRollerHelper.XInOneHundred(this.game.traitHelper.traitLevelValue(user, 'Clearcasting'))) return true;

    const mpCost = this.mpCost(user, targets, overrideEffect);

    if (user.mp.current < mpCost) {
      const extraMsg: Record<BaseClass, string> = {
        [BaseClass.Healer]: 'MP',
        [BaseClass.Mage]: 'MP',
        [BaseClass.Thief]: 'Stealth',
        [BaseClass.Warrior]: 'Rage',
        [BaseClass.Traveller]: 'Anything'
      };

      this.sendMessage(user, `You do not have enough ${extraMsg[user.baseClass]}!`);
      return false;
    }

    if (user.baseClass === BaseClass.Thief) {
      this.game.characterHelper.damage(user, mpCost);
    } else if (mpCost > 0) {
      this.game.characterHelper.manaDamage(user, mpCost);
    }

    return true;
  }

  getTarget(user: ICharacter, args: string, allowSelf = false, allowDirection = false): ICharacter|any {

    let target: ICharacter|null = null;
    args = args.trim();

    // try to do directional casting, ie, n w w e
    const splitArgs = args.split(' ');
    if (allowDirection && (splitArgs.length > 0 || args.length <= 2)) {
      let curX = user.x;
      let curY = user.y;

      for (let i = 0; i < splitArgs.length; i++) {
        // you can specify a max of 4 directions
        if (i >= 4) continue;

        const { x, y } = this.game.directionHelper.getXYFromDir(splitArgs[i] as Direction);

        const { map } = this.game.worldManager.getMap(user.map);

        // if you specify a wall tile, your cast is halted
        if (map.checkIfActualWallAt(curX + x, curY + y)) break;

        curX += x;
        curY += y;
      }

      if (curX !== user.x || curY !== user.y) {
        return { x: curX, y: curY };
      }
    }

    if (allowSelf) {
      target = user;
    }

    if (args) {
      target = this.game.targettingHelper.getFirstPossibleTargetInViewRange(user, args);
    }

    if (!target) {
      this.youDontSeeThatPerson(user);
      return null;
    }

    const range = this.range(user);

    if (this.game.directionHelper.distFrom(target, user) > range) {
      this.sendMessage(user, 'That target is too far away!');
      return null;
    }

    return target;
  }

  calcPlainAttackRange(attacker: ICharacter, defaultRange = 0): number {
    const rightHand = attacker.items.equipment[ItemSlot.RightHand];
    const leftHand = attacker.items.equipment[ItemSlot.LeftHand];

    if (!rightHand) return 0;

    const { attackRange, twoHanded } = this.game.itemHelper.getItemProperties(rightHand, ['twoHanded', 'attackRange']);

    // if you have a twohanded item and a lefthand, you can't use it
    if (twoHanded && leftHand) return -1;

    return attackRange || defaultRange;
  }
}

export class SpellCommand extends SkillCommand {
  aliases: string[] = [];
  requiresLearn = true;
  spellRef = '';
  canTargetSelf = false;

  mpCost(caster?: ICharacter, targets: ICharacter[] = [], overrideEffect?: Partial<IItemEffect>) {
    if (overrideEffect) return 0;

    const spellData = this.game.spellManager.getSpellData(this.spellRef);
    if (!spellData) return 0;

    return targets.length * (spellData.mpCost ?? 0);
  }

  range() {
    return 5;
  }

  canUse(char: ICharacter, target: ICharacter) {
    return super.canUse(char, target) && this.canCastSpell(char, target);
  }

  // called when a player casts a spell at something
  protected castSpell(caster: ICharacter | null, args: IMacroCommandArgs) {
    let targetString = args.stringArgs.trim();
    if (!targetString && this.canTargetSelf) targetString = caster?.name ?? '';

    const target = this.game.targettingHelper.getFirstPossibleTargetInViewRange(caster as IPlayer, targetString);
    if (!target) return this.youDontSeeThatPerson(caster as IPlayer);

    if (!this.canCastSpell(caster, target)) return;

    this.castSpellAt(caster, target, args);
  }

  // whether or not the spell can be cast - simple check that gets rolled into canUse
  protected canCastSpell(caster: ICharacter | null, target: ICharacter): boolean {
    if (!this.canTargetSelf && target === caster) return false;
    return true;
  }

  // cast the spell at the target - caster optional
  protected castSpellAt(caster: ICharacter | null, target: ICharacter, args?: IMacroCommandArgs) {
    const spellData = this.game.spellManager.getSpellData(this.spellRef);
    if (!spellData) return;

    const doSpellCast = () => {

      if (!target || this.game.characterHelper.isDead(target)) {
        if (caster) {
          delete caster.spellChannel;
        }

        return this.youDontSeeThatPerson(caster as IPlayer);
      }

      if (caster) {
        delete caster.spellChannel;

        if (!this.game.targettingHelper.isTargetInViewRange(caster, target)) return this.youDontSeeThatPerson(caster as IPlayer);
        if (!this.tryToConsumeMP(caster, [target], args?.overrideEffect)) return;
      }

      this.game.spellManager.castSpell(this.spellRef, caster, target, args?.overrideEffect, args?.callbacks);
    };

    if (caster && spellData.castTime) {
      this.game.messageHelper.sendLogMessageToRadius(caster, 4, { message: `**${caster.name}** begins channeling ${this.spellRef || 'a spell'}...` });
      caster.spellChannel = { ticks: spellData.castTime, callback: doSpellCast };
      return;
    }

    doSpellCast();
  }

  // default execute, primarily used by players
  execute(player: IPlayer, args: IMacroCommandArgs) {
    this.castSpell(player, args);
  }

  // default use, primarily used by npcs
  use(char: ICharacter, target: ICharacter) {
    this.castSpellAt(char, target);
  }

}
