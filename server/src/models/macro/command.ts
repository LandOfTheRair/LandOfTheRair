import { Game } from '../../helpers';
import { BaseClass, Direction, ICharacter, IMacroCommand, IMacroCommandArgs, IPlayer, ItemSlot, MessageType, SoundEffect } from '../../interfaces';

export abstract class MacroCommand implements IMacroCommand {

  abstract aliases: string[];   // the aliases representing this command
  canBeInstant = false;         // whether the command can happen immediately (ie, UI-related functions)
  canBeFast = false;            // whether the command can happen on the 'fast' cycle (used for 'faster' commands outside the round timer)
  isGMCommand = false;          // whether or not the command is GM-only

  constructor(protected game: Game) {}

  protected sendMessage(character: ICharacter, message: string, sfx?: SoundEffect): void {
    this.game.messageHelper.sendSimpleMessage(character, message, sfx);
  }

  protected sendChatMessage(character: ICharacter, message: string, sfx?: SoundEffect): void {
    this.game.messageHelper.sendLogMessageToPlayer(character, { message, sfx }, [MessageType.PlayerChat]);
  }

  protected youDontSeeThatPerson(character: ICharacter) {
    this.sendMessage(character, 'You don\'t see that person.');
  }

  execute(executor: IPlayer, args: IMacroCommandArgs): void {}    // always used only by people who can execute commands (players)
  use(executor: ICharacter, target: ICharacter): void {}          // used by anyone who has access to the command (players, npcs)
}

export abstract class Skill extends MacroCommand {

  mpCost(caster?: ICharacter, targets?: ICharacter[]) { return 0; }
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
  tryToConsumeMP(user: ICharacter, targets?: ICharacter[]): boolean {
    const mpCost = this.mpCost(user, targets);

    // thieves cast with HP instead of MP
    if (user.baseClass === BaseClass.Thief) {
      if (user.hp.maximum <= mpCost) {
        this.sendMessage(user, 'You do not have enough HP!');
        return false;
      }

    } else if (user.mp.maximum < mpCost) {
      this.sendMessage(user, 'You do not have enough MP!');
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
