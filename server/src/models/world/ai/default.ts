
import { clamp, maxBy, random, sample, size, uniq } from 'lodash';

import { Game } from '../../../helpers';
import { Direction, Hostility, IAI, ICharacter, INPC, ItemSlot, PhysicalAttackArgs, Stat } from '../../../interfaces';
import { Skill } from '../../macro';
import { WorldMap } from '../Map';
import { MapState } from '../MapState';
import { Spawner } from '../Spawner';

export class DefaultAIBehavior implements IAI {

  private path: Array<{ x: number, y: number }>;
  private randomWalkRadius: number;
  private leashRadius: number;
  private pathDisrupted: { x: number, y: number } | null = null;

  // private didNPCHaveRightHandAtSpawn: boolean;
  private stanceCooldown = 0;

  private highestAgro: ICharacter | null;
  private currentTarget: ICharacter | null;

  public get dialogParser() {
    return this.npc.dialogParser;
  }

  constructor(
    protected game: Game,
    protected map: WorldMap,
    protected mapState: MapState,
    protected spawner: Spawner,
    protected npc: INPC & { dialogParser?: boolean }
  ) {
    this.init();
  }

  tick() {
    const npc = this.npc;

    (npc.behaviors || []).forEach(beh => beh.tick(this.game, npc));

    this.game.npcHelper.tick(npc);

    if (npc.hostility === Hostility.Never) return;

    this.adjustTargetting();
    this.attemptMove();

    if (this.stanceCooldown > 0) this.stanceCooldown--;
    this.highestAgro = null;
    this.currentTarget = null;
  }

  mechanicTick() {}
  damageTaken() {}
  death() {}

  private init() {
    const { randomWalkRadius, leashRadius } = this.spawner.walkingAttributes;
    this.randomWalkRadius = randomWalkRadius;
    this.leashRadius = leashRadius;

    if (this.spawner.hasPaths) {
      this.pickNewPath();
    }

    // this.didNPCHaveRightHandAtSpawn = !!this.npc.items.equipment[ItemSlot.RightHand];

    this.sendSpawnMessage();
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

      this.highestAgro = maxBy(targetsInRange, (char: ICharacter) => possibleAgro[char.uuid]);
      if (!this.highestAgro) this.highestAgro = sample(targetsInRange);

      this.currentTarget = this.highestAgro;
    }
  }

  private attemptMove() {

    const npc = this.npc;

    let diffX = 0;
    let diffY = 0;

    const moveRate = this.game.characterHelper.getStat(npc, Stat.Move);
    let numSteps = random(0, Math.min(moveRate, this.path ? this.path.length : moveRate));
    if (numSteps < 0) numSteps = 0;

    if (this.game.diceRollerHelper.OneInX(100)) {
      this.checkGroundForItems();
    }

    let chosenSkill: Skill | null = null;

    let isThrowing = false;

    const rolledSkills = uniq(this.game.lootHelper.chooseWithReplacement(npc.usableSkills, 3));

    /*
    if(npc.$$owner) {
      rolledSkills.unshift(...npc.getBonusUsableSkillsBasedOnOwner());
      rolledSkills = shuffle(rolledSkills);
    }
    */

    rolledSkills.forEach((skill: string) => {
      if (chosenSkill) return;

      if (this.highestAgro
      && this.game.npcHelper.getAttackDamage(npc, this.highestAgro, skill) === 0
      && this.game.npcHelper.getZeroTimes(npc, this.highestAgro, skill) >= 5) {
        skill = (npc.usableSkills as any[]).find(s => s === 'Charge' || s.result === 'Charge') ? 'Charge' : 'Attack';
      }

      const rightHand = npc.items.equipment[ItemSlot.RightHand];
      if (this.highestAgro && skill === 'Attack' && rightHand && this.game.itemHelper.getItemProperty(rightHand, 'returnsOnThrow')) {
        isThrowing = true;
        skill = 'Throw';
      }

      // if it's a buff, it works slightly differently
      /*
      const skillRef = CommandExecutor.getSkillRef(skill);
      if(skillRef && skillRef.targetsFriendly) {
        const newTarget = this.findValidAllyInView(skillRef, skill);
        if(!newTarget) return;

        currentTarget = newTarget;
        chosenSkill = skillRef;
        return;
      }
      */

      if (!this.currentTarget) return;
      chosenSkill = this.checkIfCanUseSkillAndUseIt(npc, skill, this.currentTarget);
    });

    // move towards target w/ highest agro, or throw at them, or whatever
    if (this.highestAgro) {
      if (this.path && !this.pathDisrupted) this.pathDisrupted = { x: npc.x, y: npc.y };

      // use a skill that can hit the target
      if (chosenSkill) {
        const skill: Skill = chosenSkill;
        const opts: PhysicalAttackArgs = {};
        if (isThrowing) opts.throwHand = ItemSlot.RightHand;
        skill.use(npc, this.highestAgro, opts);
        this.game.characterHelper.manaDamage(npc, skill.mpCost(npc));

        // either move towards target
      } else {
        const { xChange, yChange } = this.moveTowards(this.highestAgro, moveRate);
        diffX = xChange;
        diffY = yChange;
      }

    // move along path
    } else if (this.path && this.path.length > 0) {
      let hasMovedAfterPathDisruption = false;

      if (this.pathDisrupted) {

        if (npc.x === this.pathDisrupted.x && npc.y === this.pathDisrupted.y) {
          this.pathDisrupted = null;

        } else {
          const didMoveHappen = this.game.movementHelper.moveWithPathfinding(npc, {
            xDiff: this.pathDisrupted.x - npc.x,
            yDiff: this.pathDisrupted.y - npc.y
          });

          if (didMoveHappen) hasMovedAfterPathDisruption = true;
        }
      }

      if (!hasMovedAfterPathDisruption && !this.pathDisrupted) {
        const steps: any[] = [];

        for (let i = 0; i < numSteps; i++) {
          const step = this.path.shift();

          if (step) {
            diffX += step.x;
            diffY += step.y;

            steps.push(step);
          }
        }

        this.game.movementHelper.takeSequenceOfSteps(npc, steps);

        if (this.path.length === 0) {
          this.pickNewPath();
        }
      }

    // move randomly
    } else {
      const oldX = npc.x;
      const oldY = npc.y;
      const steps = Array(numSteps).fill(null).map(() => ({ x: random(-1, 1), y: random(-1, 1) }));
      this.game.movementHelper.takeSequenceOfSteps(npc, steps);
      diffX = npc.x - oldX;
      diffY = npc.y - oldY;
    }

    /*
    if(!highestAgro && chosenSkill && currentTarget) {
      chosenSkill.use(npc, currentTarget);
      npc.mp.sub(chosenSkill.mpCost(npc));
    }
    */

    if (diffX || diffY) this.game.directionHelper.setDirBasedOnXYDiff(npc, diffX, diffY);

    if (npc.owner) {
      // TODO: leash to owner

    } else {

      // check if should leash
      const distFrom = this.game.directionHelper.distFrom(npc, this.spawner.pos);

      // if we have no path AND no target and its out of the random walk radius, or we're past the leash radius, we leash
      const noLeash = !this.path;

      if (noLeash
        && ((!this.currentTarget && this.randomWalkRadius >= 0 && distFrom > this.randomWalkRadius)
          || (this.leashRadius >= 0 && distFrom > this.leashRadius))) {

        this.sendLeashMessage();

        npc.x = this.spawner.pos.x;
        npc.y = this.spawner.pos.y;

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

  // TODO: spawn messages
  private sendSpawnMessage() {

  }

  // TODO: leash messages
  private sendLeashMessage() {

  }

  private checkGroundForItems() {

  }


  private moveTowards(target: { x: number, y: number }, moveRate: number) {
    const npc = this.npc;
    const oldX = npc.x;
    const oldY = npc.y;

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

    this.game.movementHelper.takeSequenceOfSteps(npc, steps, { isChasing: true });
    const diffX = npc.x - oldX;
    const diffY = npc.y - oldY;

    return { xChange: diffX, yChange: diffY };
  }

  private checkIfCanUseSkillAndUseIt(npc: INPC, skillName: string, target: ICharacter) {
    const skillRef = this.game.commandHandler.getSkillRef(skillName);
    if (!skillRef) return null;
    if (!skillRef.canUse(npc, target)) return null;

    return skillRef;
  }

  private pickNewPath() {
    this.path = this.spawner
      .getRandomPath()
      .split(' ')
      .map(str => {
        const [numSteps, dir] = str.split('-');
        const coord = this.game.directionHelper.getXYFromDir(dir as Direction);
        const ret: any[] = [];
        for (let i = 0; i < +numSteps; i++) {
          ret.push(coord);
        }
        return ret;
      })
      .flat();
  }

  private resetAgro(full = false) {
    if (full) {
      this.npc.agro = {};
      return;
    }

    Object.keys(this.npc.agro).forEach(uuid => this.npc.agro[uuid] = 1);
  }

}
