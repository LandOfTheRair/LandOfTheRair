
export interface ITraitTreeTrait {
  name: string;                                     // the trait name
  requiredLevel: number;                            // the level required for this trait
  maxLevel: number;                                 // the max level of the trait (defaults to 1)
  requires?: string;                                // the required trait to get this trait
  isAncient?: boolean;                              // whether or not the trait should only show up for AP buys
  treeName?: string;                                // the name of the skill tree associated with this skill
}

export interface IClassTraitTree {
  treeOrder: string[];                              // the display order of the trees
  trees: Record<string, ITraitTree>;                // all of the trees for all paths
  allTreeTraits: Record<string, ITraitTreeTrait>;   // every possible trait in every tree for learning purposes
}

export interface ITraitTreeLevel {
  traits: ITraitTreeTrait[];                        // all of the traits in this row
  requiredLevel: number;                            // the level required for this trait level
}

export interface ITraitTree {
  desc: string;                                     // the description for this tree (not currently used)
  tree: ITraitTreeLevel[];                          // the tree data for this tree
}
