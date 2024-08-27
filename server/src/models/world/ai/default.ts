import {
  clamp,
  difference,
  maxBy,
  random,
  sample,
  shuffle,
  size,
  uniq,
} from 'lodash';

import { Game } from '../../../helpers';
import {
  Allegiance,
  Direction,
  directionFromText,
  directionToOffset,
  distanceFrom,
  GameAction,
  Hostility,
  IAI,
  ICharacter,
  INPC,
  ItemClass,
  ItemSlot,
  NPCTriggerType,
  PhysicalAttackArgs,
  SoundEffect,
  Stat,
} from '../../../interfaces';
import { SkillCommand } from '../../macro';
import { WorldMap } from '../Map';
import { MapState } from '../MapState';
import { Spawner } from '../Spawner';

export class DefaultAIBehavior implements IAI {
  private path: Array<{ x: number; y: number }>;
  private randomWalkRadius: number;
  private leashRadius: number;
  private pathDisrupted: { x: number; y: number } | null = null;
  private currentTick = 0;
  protected startLoc: { x: number; y: number };

  // private didNPCHaveRightHandAtSpawn: boolean;
  private stanceCooldown = 0;
  private messageCooldown = 0;

  private highestAgro: ICharacter | null | undefined;
  private currentTarget: ICharacter | null | undefined;

  private ticksSinceSeen: Record<string, number> = {};

  public get dialogParser() {
    return this.npc.dialogParser;
  }

  constructor(
    protected game: Game,
    protected map: WorldMap,
    protected mapState: MapState,
    protected spawner: Spawner,
    protected npc: INPC & { dialogParser?: boolean },
  ) {
    this.init();
  }

  tick() {
    const npc = this.npc;
    this.currentTick++;

    if (this.game.characterHelper.isDead(npc)) return;

    this.trySendMessage();

    if (npc.owner) {
      Object.assign(npc.agro, npc.owner.agro ?? {});
    }

    (npc.behaviors || []).forEach((beh) => beh.tick(this.game, npc));

    this.game.npcHelper.tick(npc, this.currentTick);

    if (this.game.characterHelper.canAct(npc)) {
      this.adjustTargetting();
      this.attemptMove();
    } else {
      this.game.characterHelper.tryDance(npc);
    }

    if (this.stanceCooldown > 0) this.stanceCooldown--;
    this.highestAgro = null;
    this.currentTarget = null;

    if (npc.takenOverBy) {
      this.game.wsCmdHandler.sendToSocket(npc.takenOverBy.username, {
        action: GameAction.GamePatchPlayer,
        player: {
          name: npc.name,
          items: npc.items,
          x: npc.x,
          y: npc.y,
          fov: npc.fov,
          effects: npc.effects,
          hp: npc.hp,
          mp: npc.mp,
          dir: npc.dir,
          sprite: npc.sprite,
          baseClass: npc.baseClass,
          level: npc.level,
          stats: npc.stats,
          skills: npc.skills,
        },
      });
    }
  }

  mechanicTick() {}

  damageTaken({
    damage,
    attacker,
  }: {
    damage: number;
    attacker: ICharacter | undefined | null;
  }) {
    this.attemptUsePotion();
  }

  death(killer: ICharacter | undefined | null) {
    if (this.npc.takenOverBy) {
      delete this.npc.takenOverBy?.takingOver;
      delete this.npc.takenOverBy;
    }
  }

  private init() {
    const { randomWalkRadius, leashRadius } = this.spawner.walkingAttributes;
    this.randomWalkRadius =
      this.npc.maxWanderRandomlyDistance || randomWalkRadius;
    this.leashRadius = leashRadius;

    this.startLoc = { x: this.npc.x, y: this.npc.y };

    if (this.spawner.hasPaths) {
      this.pickNewPath();
    }

    // this.didNPCHaveRightHandAtSpawn = !!this.npc.items.equipment[ItemSlot.RightHand];

    this.sendSpawnMessage();
  }

  private trySendMessage() {
    this.messageCooldown--;
    if (this.messageCooldown > 0) return;

    const npc = this.npc;
    if (npc.triggers?.combat && npc.combatTicks > 0) {
      const messages = npc.triggers[NPCTriggerType.Combat].messages;
      if (messages.length > 0 && random(1, 5) === 1) {
        const send = sample(messages);

        this.game.messageHelper.sendLogMessageToRadius(npc, 4, {
          from: npc.name,
          message: send,
        });
        this.messageCooldown = 10;
      }
    }
  }

  private adjustTargetting() {
    const npc = this.npc;
    const possibleAgro = npc.agro;
    const amINearAPlayer = this.mapState.isThereAnyKnowledgeForXY(npc.x, npc.y);

    // onhit with no agro means they don't care
    if (npc.hostility === Hostility.OnHit && size(possibleAgro) === 0) {
      this.currentTarget = null;

      // either you have agro, or you can look for a target
    } else if (amINearAPlayer) {
      const targetsInRange = this.mapState.getPossibleTargetsFor(npc, 4);

      this.highestAgro = maxBy(
        targetsInRange,
        (char: ICharacter) => possibleAgro[char.uuid],
      );
      if (!this.highestAgro) this.highestAgro = sample(targetsInRange);

      this.currentTarget = this.highestAgro;
      if (this.currentTarget) {
        this.game.characterHelper.addAgro(this.npc, this.currentTarget, 1);
      }

      this.attemptToRemoveAgroFromUnseenCreatures(targetsInRange);
    }
  }

  private attemptToRemoveAgroFromUnseenCreatures(
    currentlyVisible: ICharacter[],
  ): void {
    const allAgro = Object.keys(this.npc.agro ?? {});
    const currentlyVisibleUUIDs = currentlyVisible.map((x) => x.uuid);

    const unseenPastAgros = difference(allAgro, currentlyVisibleUUIDs);
    unseenPastAgros.forEach((agro) => {
      this.ticksSinceSeen[agro] ??= 0;
      this.ticksSinceSeen[agro]++;

      if (this.ticksSinceSeen[agro] > 30) {
        delete this.ticksSinceSeen[agro];
        delete this.npc.agro[agro];
      }
    });
  }

  private attemptUsePotion() {
    // 20% chance they'll use a potion
    if (this.game.diceRollerHelper.XInOneHundred(80)) return;

    // npcs will not use a potion if they have > 30% hp
    if (this.npc.hp.current > this.npc.hp.maximum * 0.3) return;

    // no items = no healing
    if (this.npc.items.sack.items.length === 0) return;

    // find a random potion in their sack
    const potion = this.npc.items.sack.items.find(
      (x) =>
        this.game.itemHelper.getItemProperty(x, 'itemClass') ===
        ItemClass.Bottle,
    );
    if (!potion) return;

    // toss it on the ground
    potion.mods.ounces = 0;
    this.game.inventoryHelper.removeItemsFromSackByUUID(this.npc, [
      potion.uuid,
    ]);
    this.game.groundManager.addItemToGround(
      this.npc.map,
      this.npc.x,
      this.npc.y,
      potion,
    );

    this.game.messageHelper.sendLogMessageToRadius(this.npc, 4, {
      message: `${this.npc.name} gulped a potion!`,
    });

    // heal the npc
    this.game.characterHelper.heal(this.npc, this.npc.hp.maximum * 0.3);
  }

  private attemptMove() {
    const npc = this.npc;

    const moveRate = this.game.characterHelper.getStat(npc, Stat.Move);
    let numSteps = random(
      0,
      Math.min(moveRate, this.path ? this.path.length : moveRate),
    );

    // if no target and no path, we only move a max of one space
    if (!this.currentTarget && !this.path) numSteps = Math.min(numSteps, 1);
    if (numSteps < 0) numSteps = 0;

    if (this.game.diceRollerHelper.OneInX(100)) {
      this.checkGroundForItems();
    }

    let chosenSkill: SkillCommand | null;
    let chosenSkillName = 'UnchosenSkill';

    let isThrowing = false;

    const rolledSkills = shuffle(
      uniq(this.game.lootHelper.chooseWithReplacement(npc.usableSkills, 3)),
    );

    // pick a skill out of the ones we rolled
    rolledSkills.forEach((skill: string) => {
      if (chosenSkill) return;

      // if it's a buff, it works slightly differently
      const skillRef = this.game.commandHandler.getSkillRef(skill);
      if (skillRef?.targetsFriendly) {
        const newTarget = this.findValidAllyInView(skillRef);
        if (!newTarget) return;

        this.currentTarget = newTarget;
        chosenSkill = skillRef;
        return;
      }

      // try to do stuff
      if (
        this.highestAgro &&
        this.game.npcHelper.getAttackDamage(npc, this.highestAgro, skill) ===
          0 &&
        this.game.npcHelper.getZeroTimes(npc, this.highestAgro, skill) >= 5
      ) {
        skill = (npc.usableSkills as any[]).find(
          (s) => s === 'Charge' || s.result === 'Charge',
        )
          ? 'Charge'
          : 'Attack';
      }

      const rightHand = npc.items.equipment[ItemSlot.RightHand];
      if (
        this.highestAgro &&
        skill === 'Attack' &&
        rightHand &&
        this.game.itemHelper.getItemProperty(rightHand, 'returnsOnThrow')
      ) {
        isThrowing = true;
        skill = 'Throw';
      }

      if (!this.currentTarget) return;

      chosenSkill = this.checkIfCanUseSkillAndUseIt(
        npc,
        skill,
        this.currentTarget,
      );
      if (chosenSkill) {
        chosenSkillName = skill;
      }
    });

    // cast a buff spell if we have one
    if (chosenSkill!?.targetsFriendly && this.currentTarget) {
      const skill: SkillCommand = chosenSkill;

      this.game.crashContext.logContextEntry(
        npc,
        `${npc.name}:B -> ${chosenSkillName} -> ${this.currentTarget.name}`,
      );
      skill.use(npc, this.currentTarget);
      this.game.characterHelper.manaDamage(npc, skill.mpCost(npc));

      // move towards target w/ highest agro, or throw at them, or whatever
    } else if (this.highestAgro) {
      if (this.path && !this.pathDisrupted) {
        this.pathDisrupted = { x: npc.x, y: npc.y };
      }

      const skill: SkillCommand = chosenSkill!;

      // use a skill that can hit the target
      if (skill) {
        const opts: PhysicalAttackArgs = {};
        if (isThrowing) opts.throwHand = ItemSlot.RightHand;

        this.game.crashContext.logContextEntry(
          npc,
          `${npc.name}:M -> ${chosenSkillName} -> ${this.highestAgro.name}`,
        );
        skill.use(npc, this.highestAgro, opts);
        this.game.characterHelper.manaDamage(npc, skill.mpCost(npc));

        // either move towards target
      } else {
        this.game.crashContext.logContextEntry(
          npc,
          `${npc.name}:A -> ${this.highestAgro.name}`,
        );
        this.moveTowards(this.highestAgro, moveRate);
      }

      // move along path
    } else if (this.path && this.path.length > 0) {
      let hasMovedAfterPathDisruption = false;

      if (this.pathDisrupted) {
        if (npc.x === this.pathDisrupted.x && npc.y === this.pathDisrupted.y) {
          this.pathDisrupted = null;
        } else {
          const didMoveHappen = this.game.movementHelper.moveWithPathfinding(
            npc,
            {
              xDiff: this.pathDisrupted.x - npc.x,
              yDiff: this.pathDisrupted.y - npc.y,
            },
          );

          if (didMoveHappen) hasMovedAfterPathDisruption = true;
        }
      }

      if (!hasMovedAfterPathDisruption && !this.pathDisrupted) {
        const steps: any[] = [];

        for (let i = 0; i < numSteps; i++) {
          const step = this.path.shift();

          if (step) {
            steps.push(step);
          }
        }

        this.game.movementHelper.takeSequenceOfSteps(npc, steps);

        if (this.path.length === 0) {
          this.pickNewPath();
        }
      }
    } else if (this.randomWalkRadius > 0 || this.randomWalkRadius === -1) {
      this.moveRandomly(numSteps);
    }

    // only leash to owner if it can move
    if (npc.owner && (npc.stats[Stat.Move] ?? 0) > 0) {
      const distFrom = distanceFrom(npc, npc.owner);
      if (distFrom > 4) {
        npc.x = npc.owner.x;
        npc.y = npc.owner.y;
      }
    } else {
      // check if should leash
      const startPos = this.startLoc || this.spawner.pos;
      const distFrom = distanceFrom(npc, startPos);

      // if we have no path AND no target and its out of the random walk radius, or we're past the leash radius, we leash
      const noLeash = !this.path || npc.noLeash;

      if (
        noLeash &&
        ((!this.currentTarget &&
          this.randomWalkRadius >= 0 &&
          distFrom > this.randomWalkRadius) ||
          (this.leashRadius >= 0 && distFrom > this.leashRadius))
      ) {
        if (npc.name === 'Koda') return;

        this.sendLeashMessage();

        // go back to the NPCs original location or spawner if needed
        npc.x = startPos.x;
        npc.y = startPos.y;

        // chasing a player, probably - leash, fix hp, fix agro
        if (distFrom > this.leashRadius + 4) {
          this.game.characterHelper.healToFull(npc);
          this.game.characterHelper.manaToFull(npc);
          this.resetAgro(true);
        }

        // if we had a path, re-assign a path
        if (this.path && this.path.length > 0) {
          this.pickNewPath();
        }
      }
    }

    const amINearAPlayer = this.mapState.isThereAnyKnowledgeForXY(npc.x, npc.y);
    if (amINearAPlayer) {
      this.game.visibilityHelper.calculateFOV(npc);
    }
  }

  private sendSpawnMessage() {
    const spawnTrigger = this.npc.triggers?.[NPCTriggerType.Spawn];
    if (!spawnTrigger) return;

    const { messages, sfx, radius } = spawnTrigger;

    if (!messages || !messages.length) return;

    let chosenSfx!: SoundEffect;
    if (sfx && sfx.maxChance) {
      chosenSfx = this.game.diceRollerHelper.XInOneHundred(sfx.maxChance ?? 1)
        ? sfx.name
        : undefined;
    }

    this.game.messageHelper.sendLogMessageToRadius(this.npc, radius || 6, {
      message: `You hear ${sample(messages)}.`,
      sfx: chosenSfx,
    });
  }

  public sendLeashMessage() {
    const leashTrigger = this.npc.triggers?.[NPCTriggerType.Leash];
    if (!leashTrigger) return;

    const { messages, sfx, radius } = leashTrigger;

    if (!messages || !messages.length) return;

    let chosenSfx!: SoundEffect;
    if (sfx && sfx.maxChance) {
      chosenSfx = this.game.diceRollerHelper.XInOneHundred(sfx.maxChance ?? 1)
        ? sfx.name
        : undefined;
    }

    this.game.messageHelper.sendLogMessageToRadius(this.npc, radius || 6, {
      message: `You hear ${sample(messages)}.`,
      sfx: chosenSfx,
    });
  }

  private checkGroundForItems() {}

  private findValidAllyInView(skillRef: SkillCommand): ICharacter | undefined {
    const allies =
      this.game.worldManager
        .getMapStateForCharacter(this.npc)
        ?.getAllAlliesInRange(this.npc, 4) ?? [];
    if (allies.length === 0) return;

    return sample(allies.filter((ally) => skillRef.canUse(this.npc, ally)));
  }

  private moveTowards(target: { x: number; y: number }, moveRate: number) {
    const npc = this.npc;
    const oldX = npc.x;
    const oldY = npc.y;

    // one space away = no pathfinding
    if (distanceFrom(target, npc) <= 1) {
      const steps: any[] = [];

      let stepdiffX = clamp(target.x - npc.x, -moveRate, moveRate);
      let stepdiffY = clamp(target.y - npc.y, -moveRate, moveRate);

      for (let curStep = 0; curStep < moveRate; curStep++) {
        const step = { x: 0, y: 0 };

        if (stepdiffX < 0) {
          step.x = -1;
          stepdiffX++;
        } else if (stepdiffX > 0) {
          step.x = 1;
          stepdiffX--;
        }

        if (stepdiffY < 0) {
          step.y = -1;
          stepdiffY++;
        } else if (stepdiffY > 0) {
          step.y = 1;
          stepdiffY--;
        }

        steps[curStep] = step;
      }

      this.game.movementHelper.takeSequenceOfSteps(npc, steps, {
        isChasing: true,
      });

      // if we're more than one space away, use normal pathfinding
    } else {
      this.game.movementHelper.moveTowards(npc, target);
    }

    const diffX = npc.x - oldX;
    const diffY = npc.y - oldY;

    return { xChange: diffX, yChange: diffY };
  }

  private checkIfCanUseSkillAndUseIt(
    npc: INPC,
    skillName: string,
    target: ICharacter,
  ) {
    if ((target as INPC).allegiance === Allegiance.NaturalResource) return null;

    const skillRef = this.game.commandHandler.getSkillRef(skillName);
    if (!skillRef) return null;
    if (!skillRef.canUse(npc, target)) return null;

    return skillRef;
  }

  private pickNewPath() {
    this.path = this.spawner
      .getRandomPath()
      .split(' ')
      .map((str) => {
        const [numSteps, directionText] = str.split('-');
        const dir = directionFromText(directionText) ?? Direction.Center;
        const coord = directionToOffset(dir);
        const ret: any[] = [];
        for (let i = 0; i < +numSteps; i++) {
          ret.push(coord);
        }
        return ret;
      })
      .flat();
  }

  public resetAgro(full = false) {
    if (full) {
      this.npc.agro = {};
      return;
    }

    Object.keys(this.npc.agro).forEach((uuid) => (this.npc.agro[uuid] = 1));
  }

  protected moveRandomly(numSteps: number) {
    this.game.movementHelper.moveRandomly(this.npc, numSteps);
  }
}
