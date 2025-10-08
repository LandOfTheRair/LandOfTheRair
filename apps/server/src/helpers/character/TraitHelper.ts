import { Injectable } from 'injection-js';
import { cloneDeep } from 'lodash';

import type {
  BaseClass,
  ICharacter,
  IClassTraitTree,
  IPlayer,
  ITraitTreeTrait,
} from '@lotr/interfaces';

import {
  traitGet,
  traitLevel,
  traitLevelValue,
  traitTreeGet,
} from '@lotr/content';
import { rollInOneHundred } from '@lotr/rng';
import { BaseService } from '../../models/BaseService';

@Injectable()
export class TraitHelper extends BaseService {
  public init() {}

  // get the raw trait tree from the trait info hash
  public getTraitTree(baseClass: BaseClass): IClassTraitTree {
    return traitTreeGet(baseClass);
  }

  // get the specific trait in the tree
  public getTraitInTree(baseClass: BaseClass, trait: string): ITraitTreeTrait {
    return this.getTraitTree(baseClass).allTreeTraits[trait];
  }

  // whether or not the player can learn the trait
  public canLearnTrait(player: IPlayer, trait: string): boolean {
    const traitRef = this.getTraitInTree(player.baseClass, trait);
    if (!traitRef) return false;

    return (
      (traitRef.isAncient ? player.traits.ap > 0 : player.traits.tp > 0) &&
      (player.traits.traitsLearned[trait] ?? 0) < traitRef.maxLevel &&
      player.level >= traitRef.requiredLevel &&
      (traitRef.requires
        ? traitLevel(player, traitRef.requires) >=
          this.getTraitInTree(player.baseClass, traitRef.requires).maxLevel
        : true)
    );
  }

  // get all of the learned traits, used mostly for recalculating the trait hash
  public getAllLearnedTraits(player: IPlayer): Record<string, number> {
    return player.traits.traitsLearned;
  }

  // learn a trait! very easy. increment a number, decrement a diff one
  public learnTrait(
    player: IPlayer,
    trait: string,
    doRecalculate = true,
  ): void {
    if (!this.canLearnTrait(player, trait)) return;

    const traitRef = traitGet(trait, `LT:${player.name}`);
    if (!traitRef) return;

    if (traitRef.isAncient) {
      player.traits.ap--;
    } else {
      player.traits.tp--;
    }

    player.traits.traitsLearned[trait] =
      player.traits.traitsLearned[trait] || 0;
    player.traits.traitsLearned[trait]++;

    if (doRecalculate) {
      // last, recalculate stats because lots of traits affect stats
      this.game.characterHelper.recalculateEverything(player);
    }
  }

  // unlearn a trait! it's the opposite of the above.
  public unlearnTrait(player: IPlayer, trait: string): void {
    if (!traitLevel(player, trait)) return;

    const traitRef = traitGet(trait, `ULT:${player.name}`);
    if (!traitRef) return;

    if (traitRef.isAncient) {
      player.traits.ap++;
    } else {
      player.traits.tp++;
    }
    player.traits.traitsLearned[trait]--;

    // last, recalculate stats because lots of traits affect stats
    this.game.characterHelper.recalculateEverything(player);
  }

  // reset all traits. since everything costs 1 tp, we can sum up all of our learned traits and get the right number.
  public resetTraits(player: IPlayer): void {
    // unlearn them all (unless ancient) and recalculate the max tp
    Object.keys(player.traits.traitsLearned).forEach((trait) => {
      const traitRef = traitGet(trait, `RT:${player.name}`);
      if (!traitRef) return;
      if (traitRef.isAncient) return;

      delete player.traits.traitsLearned[trait];
    });

    player.traits.tp = (player.level || 1) + 1;

    // remove effects that might cause problems
    this.game.effectHelper.removeSimilarEffects(player, 'Stance', '', true);

    // last, recalculate stats because lots of traits affect stats
    this.game.characterHelper.recalculateEverything(player);
  }

  // shorthand to roll a trait
  public rollTraitValue(char: ICharacter, trait: string): boolean {
    const levelValue = traitLevelValue(char, trait);
    if (levelValue <= 0) return false;
    if (levelValue >= 100) return true;

    return rollInOneHundred(levelValue);
  }

  // build management
  public saveBuild(player: IPlayer, buildSlot: number): void {
    player.traits.savedBuilds[buildSlot] = {
      name: `Build ${buildSlot + 1}`,
      traits: cloneDeep(player.traits.traitsLearned),
      runes: cloneDeep(player.runes),
    };

    this.game.messageHelper.sendLogMessageToPlayer(player, {
      message: `Saved ${player.traits.savedBuilds[buildSlot].name}!`,
    });
  }

  public hasBuild(player: IPlayer, buildSlot: number): boolean {
    return !!player.traits.savedBuilds[buildSlot];
  }

  public loadBuild(player: IPlayer, buildSlot: number): void {
    if (!this.hasBuild(player, buildSlot)) return;

    this.resetTraits(player);

    const loadBuild = player.traits.savedBuilds[buildSlot];
    this.game.messageHelper.sendLogMessageToPlayer(player, {
      message: `Loading ${loadBuild.name}...`,
    });

    Object.keys(loadBuild.traits).forEach((trait) => {
      for (let i = 0; i < loadBuild.traits[trait]; i++) {
        this.learnTrait(player, trait, false);
      }
    });

    if (loadBuild.runes) {
      player.runes = loadBuild.runes;
    }

    this.game.characterHelper.recalculateEverything(player);
  }

  public renameBuild(player: IPlayer, buildSlot: number, name: string): void {
    if (!this.hasBuild(player, buildSlot)) return;

    player.traits.savedBuilds[buildSlot].name = name;
  }
}
