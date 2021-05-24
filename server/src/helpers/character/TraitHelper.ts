
import { Injectable } from 'injection-js';

import { BaseClass, ICharacter, IClassTraitTree, IPlayer, ITrait, ITraitTreeTrait } from '../../interfaces';

import { BaseService } from '../../models/BaseService';

@Injectable()
export class TraitHelper extends BaseService {

  public init() {}

  // get the trait data raw from the trait info hash
  public getTraitData(traitName: string): ITrait {
    return this.game.contentManager.getTrait(traitName);
  }

  // get the raw trait tree from the trait info hash
  public getTraitTree(baseClass: BaseClass): IClassTraitTree {
    return this.game.contentManager.getTraitTree(baseClass);
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
    return character.allTraits[trait] ?? 0;
  }

  // the level of the trait for the character
  public traitLevelValue(character: ICharacter, trait: string): number {
    const traitData = this.getTraitData(trait);
    if (!traitData || !traitData.valuePerTier) return 0;

    return traitData.valuePerTier * (character.allTraits[trait] || 0);
  }

  // whether or not the player can learn the trait
  public canLearnTrait(player: IPlayer, trait: string): boolean {
    const traitRef = this.getTraitInTree(player.baseClass, trait);
    if (!traitRef) return false;

    return (traitRef.isAncient ? player.traits.ap > 0 : player.traits.tp > 0)
        && (player.traits.traitsLearned[trait] ?? 0) < traitRef.maxLevel
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
  public learnTrait(player: IPlayer, trait: string, doRecalculate = true): void {
    if (!this.canLearnTrait(player, trait)) return;

    const traitRef = this.getTraitData(trait);
    if (!traitRef) return;

    if (traitRef.isAncient) {
      player.traits.ap--;
    } else {
      player.traits.tp--;
    }

    player.traits.traitsLearned[trait] = player.traits.traitsLearned[trait] || 0;
    player.traits.traitsLearned[trait]++;

    if (doRecalculate) {
      // last, recalculate stats because lots of traits affect stats
      this.game.characterHelper.recalculateEverything(player);
    }
  }

  // unlearn a trait! it's the opposite of the above.
  public unlearnTrait(player: IPlayer, trait: string): void {
    if (!this.traitLevel(player, trait)) return;

    const traitRef = this.getTraitData(trait);
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
    Object.keys(player.traits.traitsLearned).forEach(trait => {
      const traitRef = this.getTraitData(trait);
      if (!traitRef) return;
      if (traitRef.isAncient) return;

      delete player.traits.traitsLearned[trait];
    });

    player.traits.tp = (player.level || 1) + 1;

    // last, recalculate stats because lots of traits affect stats
    this.game.effectHelper.removeSimilarEffects(player, 'Stance', '');
    this.game.characterHelper.recalculateEverything(player);

  }

  // shorthand to roll a trait
  public rollTraitValue(char: ICharacter, trait: string): boolean {
    const levelValue = this.game.traitHelper.traitLevelValue(char, trait);
    if (levelValue <= 0) return false;
    if (levelValue >= 100) return true;

    return this.game.diceRollerHelper.XInOneHundred(levelValue);
  }

}
