
import { Injectable } from 'injection-js';

import { BaseClass, BaseService, ICharacter, IClassTraitTree, IPlayer, ITrait, ITraitTreeTrait, Stat } from '../../interfaces';

import * as allTraitTrees from '../../../content/_output/trait-trees.json';
import * as allTraits from '../../../content/_output/traits.json';

@Injectable()
export class TraitHelper extends BaseService {

  public init() {}

  // get the trait data raw from the trait info hash
  public getTraitData(traitName: string): ITrait {
    return allTraits[traitName];
  }

  // get the raw trait tree from the trait info hash
  public getTraitTree(baseClass: BaseClass): IClassTraitTree {
    return allTraitTrees[baseClass];
  }

  // get the specific trait in the tree
  public getTraitInTree(baseClass: BaseClass, trait: string): ITraitTreeTrait {
    return this.getTraitTree(baseClass).allTreeTraits[trait];
  }

  // whether or not the player has learned the trait
  public hasLearnedTrait(player: IPlayer, trait: string): boolean {
    return this.traitLevel(player, trait) > 0;
  }

  // the level of the trait for the character
  public traitLevel(character: ICharacter, trait: string): number {
    return character.allTraits[trait] || 0;
  }

  // whether or not the player can learn the trait
  public canLearnTrait(player: IPlayer, trait: string): boolean {
    const traitRef = this.getTraitInTree(player.baseClass, trait);

    return (traitRef.isAncient ? player.traits.ap > 0 : player.traits.tp > 0)
        && this.traitLevel(player, trait) < traitRef.maxLevel
        && player.level >= traitRef.requiredLevel
        && (
          traitRef.requires
            ? this.traitLevel(player, traitRef.requires) >= this.getTraitInTree(player.baseClass, traitRef.requires).maxLevel
            : true
          );
  }

  // get all of the learned traits, used mostly for recalculating the trait hash
  public getAllLearnedTraits(player: IPlayer): Record<string, number> {
    return player.traits.traitsLearned;
  }

  // learn a trait! very easy. increment a number, decrement a diff one
  public learnTrait(player: IPlayer, trait: string): void {
    if (!this.canLearnTrait(player, trait)) return;

    const traitRef = this.getTraitData(trait);

    if (traitRef.isAncient) {
      player.traits.ap--;
    } else {
      player.traits.tp--;
    }

    player.traits.traitsLearned[trait] = player.traits.traitsLearned[trait] || 0;
    player.traits.traitsLearned[trait]++;

    // last, recalculate stats because lots of traits affect stats
    this.game.characterHelper.calculateStatTotals(player);
  }

  // unlearn a trait! it's the opposite of the above.
  public unlearnTrait(player: IPlayer, trait: string): void {
    if (!this.traitLevel(player, trait)) return;

    const traitRef = this.getTraitData(trait);

    if (traitRef.isAncient) {
      player.traits.ap++;
    } else {
      player.traits.tp++;
    }
    player.traits.traitsLearned[trait]--;

    // last, recalculate stats because lots of traits affect stats
    this.game.characterHelper.calculateStatTotals(player);
  }

  // reset all traits. since everything costs 1 tp, we can sum up all of our learned traits and get the right number.
  public resetTraits(player: IPlayer): void {

    // unlearn them all and recalculate the max tp
    player.traits.traitsLearned = {};
    player.traits.tp = (player.level || 1) * 2;
    player.traits.ap = player.ancientLevel || 0;

    // last, recalculate stats because lots of traits affect stats
    this.game.characterHelper.calculateStatTotals(player);

  }

}
