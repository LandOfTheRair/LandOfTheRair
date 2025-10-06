

export interface ICharacterTraits {
  tp: number;
  ap: number;
  traitsLearned: Record<string, number>;
  savedBuilds: Record<number, { name: string; traits: Record<string, number>; runes: string[] }>;
}
