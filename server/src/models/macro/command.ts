import { isNumber } from 'lodash';

import { Game } from '../../helpers';
import {
  Direction,
  directionFromText,
  directionToOffset,
  distanceFrom,
  ICharacter,
  IItemEffect,
  IMacroCommand,
  IMacroCommandArgs,
  IPlayer,
  ItemClass,
  ItemSlot,
  MessageType,
  SoundEffect,
  Stat,
} from '../../interfaces';
import { Player } from '../orm';

export abstract class MacroCommand implements IMacroCommand {
  abstract aliases: string[]; // the aliases representing this command
  canBeInstant = false; // whether the command can happen immediately (ie, UI-related functions)
  canBeFast = false; // whether the command can happen on the 'fast' cycle (used for 'faster' commands outside the round timer)
  isGMCommand = false; // whether or not the command is GM-only
  requiresLearn = false; // whether or not the command must be learned first
  canUseWhileDead = false; // whether or not the command can be used while dead

  constructor(protected game: Game) {}

  protected sendMessage(
    character: ICharacter,
    message: string,
    sfx?: SoundEffect,
  ): void {
    this.game.messageHelper.sendSimpleMessage(character, message, sfx);
  }

  protected sendChatMessage(
    character: ICharacter,
    message: string,
    sfx?: SoundEffect,
  ): void {
    this.game.messageHelper.sendLogMessageToPlayer(
      character,
      { message, sfx },
      [MessageType.PlayerChat],
    );
  }

  protected youDontSeeThatPerson(character: ICharacter, targetArgs: string) {
    this.game.messageHelper.sendLogMessageToPlayer(character, {
      message: "You don't see that person.",
      setTarget: null,
    });

    // clear the queue of this person if we don't see them
    if (targetArgs) {
      this.game.playerHelper.clearActionQueue(character as Player, targetArgs);
    }
  }

  execute(executor: IPlayer, args: IMacroCommandArgs): void {} // always used only by people who can execute commands (players)
  use(
    executor: ICharacter | null,
    target: ICharacter | null,
    args?: any,
    targetsPosition?: { x: number; y: number; map: string },
  ): void {} // used by anyone who has access to the command (players, npcs, environment)

  range(caster?: ICharacter): number {
    return 0;
  }

  // get either the target character or the center for an aoe
  getTarget(
    user: ICharacter,
    args: string,
    allowSelf = false,
    allowDirection = false,
  ): ICharacter | { x: number; y: number; map: string } | null {
    let target: ICharacter | null = null;
    args = args.trim();

    const range = this.range(user);

    // try to do directional casting, ie, n w w e
    const splitArgs = args.split(' ');

    if (allowDirection && (splitArgs.length > 0 || args.length <= 2)) {
      let curX = user.x;
      let curY = user.y;

      // can only go as many steps as range
      for (let i = 0; i < Math.min(range, splitArgs.length); i++) {
        // you can specify a max of 4 directions
        if (i >= 4) continue;

        const direction = directionFromText(splitArgs[i]) ?? Direction.Center;
        if (direction === Direction.Center) break;
        const offset = directionToOffset(direction);

        const map = this.game.worldManager.getMap(user.map)?.map;
        if (!map) continue;

        // if you specify a wall tile, your cast is halted
        if (map.checkIfActualWallAt(curX + offset.x, curY + offset.y)) break;

        curX += offset.x;
        curY += offset.y;
      }

      if (curX !== user.x || curY !== user.y) {
        return { map: user.map, x: curX, y: curY };
      }
    }

    if (args && target !== user) {
      target = this.game.targettingHelper.getFirstPossibleTargetInViewRange(
        user,
        args,
      );
    }

    if (allowSelf && !target) {
      target = user;
    }

    if (!target) {
      this.youDontSeeThatPerson(user, args);
      return null;
    }

    if (distanceFrom(target, user) > range) {
      this.sendMessage(user, 'That target is too far away!');
      return null;
    }

    return target;
  }
}

export abstract class SkillCommand extends MacroCommand {
  targetsFriendly = false; // whether or not the command can target friendly creatures (for enemies)

  mpCost(
    caster?: ICharacter,
    targets?: ICharacter[],
    overrideEffect?: Partial<IItemEffect>,
  ) {
    return 0;
  }

  hpCost(caster?: ICharacter) {
    return 0;
  }

  // whether or not we can use the skill
  canUse(user: ICharacter, target: ICharacter): boolean {
    if (user.mp.current < this.mpCost(user)) return false;
    if (user.hp.current < this.hpCost(user)) return false;
    if (distanceFrom(user, target) > this.range(user)) return false;
    return true;
  }

  // try to consume the mp (returning false if we fail)
  tryToConsumeMP(
    user: ICharacter,
    targets?: ICharacter[],
    overrideEffect?: Partial<IItemEffect>,
  ): boolean {
    if (this.game.traitHelper.rollTraitValue(user, 'Clearcasting')) return true;

    const mpCost = this.mpCost(user, targets, overrideEffect);

    const extraMsg =
      this.game.contentManager.getClassConfigSetting<'castResource'>(
        user.baseClass,
        'castResource',
      );

    const usesMana = this.game.contentManager.getClassConfigSetting<'usesMana'>(
      user.baseClass,
      'usesMana',
    );

    if (!usesMana) {
      if (user.hp.current <= mpCost) {
        this.sendMessage(user, `You do not have enough ${extraMsg}!`);
        return false;
      }

      this.game.characterHelper.damage(user, mpCost);
    } else if (mpCost > 0) {
      if (user.mp.current < mpCost) {
        this.sendMessage(user, `You do not have enough ${extraMsg}!`);
        return false;
      }

      this.game.characterHelper.manaDamage(user, mpCost);
    }

    return true;
  }

  calcPlainAttackRange(attacker: ICharacter, defaultRange = 0): number {
    const rightHand = attacker.items.equipment[ItemSlot.RightHand];
    const leftHand = attacker.items.equipment[ItemSlot.LeftHand];

    if (!rightHand) return 0;

    const { attackRange, twoHanded } = this.game.itemHelper.getItemProperties(
      rightHand,
      ['twoHanded', 'attackRange'],
    );

    // if you have a twohanded item and a lefthand, you can't use it
    if (
      twoHanded &&
      leftHand &&
      !this.game.traitHelper.traitLevel(attacker, 'TitanGrip')
    ) {
      return -1;
    }

    return attackRange || defaultRange;
  }
}

export class SpellCommand extends SkillCommand {
  override aliases: string[] = [];
  override requiresLearn = true;
  isAutomaticSpell = false;
  spellRef = '';
  spellDataRef = '';
  canTargetSelf = false;

  override mpCost(
    caster?: ICharacter,
    targets: ICharacter[] = [],
    overrideEffect?: Partial<IItemEffect>,
  ) {
    if (overrideEffect) return 0;

    const spellData = this.game.spellManager.getSpellData(
      this.spellDataRef || this.spellRef,
      `MPC:${caster?.name}`,
    );
    if (!spellData) return 0;

    let cost = Math.max(targets.length, 1) * (spellData.mpCost ?? 0);

    // try to do arcane hunger
    if (caster && spellData.spellMeta.doesAttack) {
      const arcaneHunger = this.game.effectHelper.getEffect(
        caster,
        'ArcaneHunger',
      );
      if (arcaneHunger) {
        const charges = arcaneHunger.effectInfo.charges ?? 1;
        cost += cost * (charges / 5);
      }
    }

    // try to do wand/totem specialty
    if (caster) {
      const rightHand = caster.items.equipment[ItemSlot.RightHand];

      if (rightHand) {
        const itemClass = this.game.itemHelper.getItemProperty(
          rightHand,
          'itemClass',
        );

        if (itemClass === ItemClass.Wand) {
          cost *= Math.max(
            0,
            1 - this.game.traitHelper.traitLevelValue(caster, 'WandSpecialty'),
          );
        }

        if (itemClass === ItemClass.Totem) {
          cost *= Math.max(
            0,
            1 - this.game.traitHelper.traitLevelValue(caster, 'TotemSpecialty'),
          );
        }
      }
    }

    return Math.floor(cost);
  }

  override range(char: ICharacter): number {
    return 5;
  }

  override canUse(char: ICharacter, target: ICharacter) {
    let isBlockedByEffect = false;

    if (this.isAutomaticSpell && this.spellRef) {
      const spellData = this.game.spellManager.getSpellData(
        this.spellRef,
        `CU:${char.name}`,
      );
      const effectName = spellData.spellMeta.linkedEffectName;

      if (effectName) {
        const effectData = this.game.contentManager.getEffect(
          effectName,
          `CU:${char?.name}`,
        );
        const recentlyEffect = effectData.effectMeta.recentlyRef;

        isBlockedByEffect =
          this.game.effectHelper.hasEffect(target, effectName) ||
          !!(
            recentlyEffect &&
            this.game.effectHelper.hasEffect(target, recentlyEffect)
          );
      }
    }

    return (
      super.canUse(char, target) &&
      this.canCastSpell(char, target) &&
      !isBlockedByEffect
    );
  }

  // called when a player casts a spell at something
  protected castSpell(
    caster: ICharacter | null,
    args: Partial<IMacroCommandArgs>,
  ): string | boolean {
    // if the spell is party-based, target the whole party
    let targets: ICharacter[] = [];
    let primaryTarget:
      | { x: number; y: number; map: string }
      | ICharacter
      | null = args.primaryTarget ?? null;

    const spellData = this.game.spellManager.getSpellData(
      this.spellDataRef || this.spellRef,
      `CS:${caster?.name}`,
    );

    // if we're not a party target spell, we look for a primary target (location or character)
    if (caster && !spellData.spellMeta.targetsParty && args?.stringArgs) {
      primaryTarget = this.getTarget(
        caster,
        (args?.stringArgs ?? '').trim(),
        this.canTargetSelf,
        spellData.spellMeta.allowDirectional,
      );
      if ((primaryTarget as ICharacter)?.name) {
        targets = [primaryTarget as ICharacter];
      }
    }

    // if we have a primary target and we have an aoe spell
    if (primaryTarget && spellData.spellMeta.aoe) {
      // attempt to boost the range of the spell
      let rangeBoost = 0;
      if (caster && spellData.spellMeta.aoeRangeTrait) {
        rangeBoost = this.game.traitHelper.traitLevelValue(
          caster,
          spellData.spellMeta.aoeRangeTrait,
        );
      }

      targets = this.game.targettingHelper.getPossibleAOETargets(
        caster,
        primaryTarget,
        (spellData.spellMeta.range ?? 0) + rangeBoost,
      );
    }

    // if we target the party we do it all differently
    if (caster && spellData.spellMeta.targetsParty) {
      targets = this.game.partyHelper.getAllPartyMembersInRange(
        caster as IPlayer,
      );
      targets.push(caster);
    }

    // hit each of the targets
    const didHit = targets.map((target, idx) => {
      if (!target) {
        return this.youDontSeeThatPerson(
          caster as IPlayer,
          args?.stringArgs ?? '',
        );
      }

      if (!this.canCastSpell(caster, target)) return;

      args.targetNumber = idx;

      return this.castSpellAt(caster, target, args);
    });

    if (didHit.some((hit) => !hit)) return false;

    // visually cast the spell anyway
    if ((caster || primaryTarget) && spellData.spellMeta.aoe) {
      const x = primaryTarget?.x ?? caster?.x ?? 0;
      const y = primaryTarget?.y ?? caster?.y ?? 0;
      const map = primaryTarget?.map ?? caster?.map ?? '';

      if (x > 0 && y > 0 && map) {
        return this.castSpellAt(caster, null, args, { x, y, map });
      }
    }

    return true;
  }

  // whether or not the spell can be cast - simple check that gets rolled into canUse
  protected canCastSpell(
    caster: ICharacter | null,
    target: ICharacter,
  ): boolean {
    if (!this.canTargetSelf && target === caster) return false;

    // if they're hostile - no buffing
    const spellData = this.game.spellManager.getSpellData(
      this.spellRef,
      `CCS:${caster?.name}`,
    );
    if (!spellData) return false;

    const { noHostileTarget } = spellData.spellMeta;
    const areBothPlayers =
      caster &&
      this.game.characterHelper.isPlayer(caster) &&
      this.game.characterHelper.isPlayer(target);
    if (
      caster &&
      noHostileTarget &&
      !areBothPlayers &&
      this.game.targettingHelper.checkTargetForHostility(caster, target)
    ) {
      return false;
    }

    return true;
  }

  // cast the spell at the target - caster optional
  protected castSpellAt(
    caster: ICharacter | null,
    target: ICharacter | null,
    args?: Partial<IMacroCommandArgs>,
    targetsPosition?: { x: number; y: number; map: string },
  ): boolean {
    const spellData = this.game.spellManager.getSpellData(
      this.spellRef,
      `CSA:${caster?.name}`,
    );
    if (!spellData) {
      this.game.logger.warn(
        'SpellCommand',
        `No spellData found for ${this.spellRef}.`,
      );

      if (caster) {
        this.game.messageHelper.sendSimpleMessage(
          caster,
          `Could not cast ${this.spellRef} - no data was found.`,
        );
      }

      return false;
    }

    const doSpellCast = (): boolean => {
      // if there's no target, we bail
      if (
        !targetsPosition &&
        (!target || this.game.characterHelper.isDead(target))
      ) {
        this.youDontSeeThatPerson(caster as IPlayer, args?.stringArgs ?? '');
        return false;
      }

      // if we have a caster, they are no longer channeling, and we need to take their mp
      if (caster) {
        if (
          caster !== target &&
          target &&
          !isNumber(args?.targetNumber) &&
          !this.game.targettingHelper.isTargetInViewRange(caster, target)
        ) {
          this.youDontSeeThatPerson(caster as IPlayer, args?.stringArgs ?? '');
          return false;
        }

        const castTargets = target ? [target] : [];

        if (
          (spellData.spellMeta.aoe || target?.name) &&
          !args?.targetNumber &&
          !this.tryToConsumeMP(caster, castTargets, args?.overrideEffect)
        ) {
          return false;
        }
      }

      // try to reflect the spell if possible
      let hitTarget = target;
      if (
        caster &&
        target &&
        target !== caster &&
        this.game.characterHelper.isPlayer(target) &&
        !spellData.spellMeta.noReflect &&
        this.game.diceRollerHelper.XInOneHundred(
          this.game.characterHelper.getStat(target, Stat.SpellReflectChance),
        )
      ) {
        hitTarget = caster;
      }

      this.game.spellManager.castSpell(
        this.spellRef,
        caster,
        hitTarget,
        args?.overrideEffect,
        args?.callbacks,
        args,
        targetsPosition,
      );

      return true;
    };

    if (caster && spellData.castTime) {
      this.game.messageHelper.sendLogMessageToRadius(caster, 4, {
        message: `**${caster.name}** begins channeling ${this.spellRef || 'a spell'}...`,
      });
      caster.spellChannel = {
        ticks: spellData.castTime,
        callback: doSpellCast,
      };
      return true;
    }

    return doSpellCast();
  }

  // default execute, primarily used by players
  override execute(
    player: IPlayer,
    args: IMacroCommandArgs,
  ): string | boolean | void {
    if (!args.stringArgs && this.canTargetSelf) args.stringArgs = player.uuid;
    return this.castSpell(player, args);
  }

  // default use, primarily used by npcs
  override use(
    char: ICharacter | null,
    target: ICharacter | null,
    args?: any,
    targetsPosition?: { x: number; y: number; map: string },
  ) {
    // aoe spells are handled differently
    const spellData = this.game.spellManager.getSpellData(
      this.spellDataRef || this.spellRef,
      `USE:${char?.name}`,
    );
    if (spellData.spellMeta.aoe) {
      this.castSpell(char, {
        primaryTarget: target ?? targetsPosition,
        ...(args || {}),
      });
      return;
    }

    this.castSpellAt(char, target, args, targetsPosition);
  }
}
