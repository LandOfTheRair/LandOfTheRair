import type { ICharacter } from '@lotr/interfaces';
import { LearnedSpell } from '@lotr/interfaces';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  forceSpellLearnStatus,
  hasLearned,
  hasLearnedFromItem,
  learnedState,
} from './learning';

describe('Learning Functions', () => {
  const createMockCharacter = (
    learnedSpells: Record<string, LearnedSpell> = {},
  ): ICharacter =>
    ({
      learnedSpells,
    }) as unknown as ICharacter;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('learnedState', () => {
    it('should return learned state for existing spell', () => {
      const character = createMockCharacter({
        fireball: LearnedSpell.FromTraits,
        heal: LearnedSpell.FromItem,
      });

      expect(learnedState(character, 'fireball')).toBe(LearnedSpell.FromTraits);
      expect(learnedState(character, 'heal')).toBe(LearnedSpell.FromItem);
    });

    it('should return Unlearned for non-existing spell', () => {
      const character = createMockCharacter({
        fireball: LearnedSpell.FromTraits,
      });

      const result = learnedState(character, 'unknown-spell');

      expect(result).toBe(LearnedSpell.Unlearned);
    });

    it('should handle case insensitive spell names', () => {
      const character = createMockCharacter({
        fireball: LearnedSpell.FromTraits,
      });

      expect(learnedState(character, 'FIREBALL')).toBe(LearnedSpell.FromTraits);
      expect(learnedState(character, 'FireBall')).toBe(LearnedSpell.FromTraits);
      expect(learnedState(character, 'fireball')).toBe(LearnedSpell.FromTraits);
    });

    it('should handle empty learnedSpells object', () => {
      const character = createMockCharacter({});

      const result = learnedState(character, 'fireball');

      expect(result).toBe(LearnedSpell.Unlearned);
    });

    it('should handle undefined learnedSpells', () => {
      const character = { learnedSpells: undefined } as unknown as ICharacter;

      expect(() => learnedState(character, 'fireball')).toThrow();
    });

    it('should handle null learnedSpells', () => {
      const character = { learnedSpells: null } as unknown as ICharacter;

      expect(() => learnedState(character, 'fireball')).toThrow();
    });

    it('should handle empty spell name', () => {
      const character = createMockCharacter({
        '': LearnedSpell.FromTraits,
      });

      const result = learnedState(character, '');

      expect(result).toBe(LearnedSpell.FromTraits);
    });

    it('should handle undefined spell name', () => {
      const character = createMockCharacter({});

      expect(() => learnedState(character, undefined as any)).toThrow();
    });

    it('should handle null spell name', () => {
      const character = createMockCharacter({});

      expect(() => learnedState(character, null as any)).toThrow();
    });

    it('should handle spell with special characters', () => {
      const character = createMockCharacter({
        'spell-with-dashes': LearnedSpell.FromTraits,
        spell_with_underscores: LearnedSpell.FromItem,
      });

      expect(learnedState(character, 'spell-with-dashes')).toBe(
        LearnedSpell.FromTraits,
      );
      expect(learnedState(character, 'spell_with_underscores')).toBe(
        LearnedSpell.FromItem,
      );
    });

    it('should handle spell with numbers', () => {
      const character = createMockCharacter({
        spell1: LearnedSpell.FromTraits,
        '123spell': LearnedSpell.FromItem,
      });

      expect(learnedState(character, 'spell1')).toBe(LearnedSpell.FromTraits);
      expect(learnedState(character, '123spell')).toBe(LearnedSpell.FromItem);
    });

    it('should handle spell with spaces', () => {
      const character = createMockCharacter({
        'magic missile': LearnedSpell.FromTraits,
      });

      const result = learnedState(character, 'Magic Missile');

      expect(result).toBe(LearnedSpell.FromTraits);
    });

    it('should handle all LearnedSpell enum values', () => {
      const character = createMockCharacter({
        spell1: LearnedSpell.Unlearned,
        spell2: LearnedSpell.FromTraits,
        spell3: LearnedSpell.FromItem,
      });

      expect(learnedState(character, 'spell1')).toBe(LearnedSpell.Unlearned);
      expect(learnedState(character, 'spell2')).toBe(LearnedSpell.FromTraits);
      expect(learnedState(character, 'spell3')).toBe(LearnedSpell.FromItem);
    });
  });

  describe('hasLearned', () => {
    it('should return true for learned spell', () => {
      const character = createMockCharacter({
        fireball: LearnedSpell.FromTraits,
      });

      const result = hasLearned(character, 'fireball');

      expect(result).toBe(true);
    });

    it('should return true for spell learned from item', () => {
      const character = createMockCharacter({
        heal: LearnedSpell.FromItem,
      });

      const result = hasLearned(character, 'heal');

      expect(result).toBe(true);
    });

    it('should return false for unlearned spell', () => {
      const character = createMockCharacter({
        fireball: LearnedSpell.Unlearned,
      });

      const result = hasLearned(character, 'fireball');

      expect(result).toBe(false);
    });

    it('should return false for non-existing spell', () => {
      const character = createMockCharacter({
        fireball: LearnedSpell.FromTraits,
      });

      const result = hasLearned(character, 'unknown-spell');

      expect(result).toBe(false);
    });

    it('should handle case insensitive spell names', () => {
      const character = createMockCharacter({
        fireball: LearnedSpell.FromTraits,
      });

      expect(hasLearned(character, 'FIREBALL')).toBe(true);
      expect(hasLearned(character, 'FireBall')).toBe(true);
      expect(hasLearned(character, 'fireball')).toBe(true);
    });

    it('should handle empty learnedSpells object', () => {
      const character = createMockCharacter({});

      const result = hasLearned(character, 'fireball');

      expect(result).toBe(false);
    });

    it('should handle multiple spells with different states', () => {
      const character = createMockCharacter({
        spell1: LearnedSpell.FromTraits,
        spell2: LearnedSpell.FromItem,
        spell3: LearnedSpell.Unlearned,
      });

      expect(hasLearned(character, 'spell1')).toBe(true);
      expect(hasLearned(character, 'spell2')).toBe(true);
      expect(hasLearned(character, 'spell3')).toBe(false);
    });

    it('should handle undefined spell name', () => {
      const character = createMockCharacter({});

      expect(() => hasLearned(character, undefined as any)).toThrow();
    });

    it('should handle null spell name', () => {
      const character = createMockCharacter({});

      expect(() => hasLearned(character, null as any)).toThrow();
    });

    it('should handle empty spell name', () => {
      const character = createMockCharacter({
        '': LearnedSpell.FromTraits,
      });

      const result = hasLearned(character, '');

      expect(result).toBe(true);
    });

    it('should handle very long spell names', () => {
      const longSpellName = 'a'.repeat(1000);
      const character = createMockCharacter({
        [longSpellName]: LearnedSpell.FromTraits,
      });

      const result = hasLearned(character, longSpellName);

      expect(result).toBe(true);
    });
  });

  describe('hasLearnedFromItem', () => {
    it('should return true when spell is learned from item', () => {
      const character = createMockCharacter({
        heal: LearnedSpell.FromItem,
      });

      const result = hasLearnedFromItem(character, 'heal');

      expect(result).toBe(true);
    });

    it('should return false when spell is learned normally', () => {
      const character = createMockCharacter({
        fireball: LearnedSpell.FromTraits,
      });

      const result = hasLearnedFromItem(character, 'fireball');

      expect(result).toBe(false);
    });

    it('should return false when spell is unlearned', () => {
      const character = createMockCharacter({
        fireball: LearnedSpell.Unlearned,
      });

      const result = hasLearnedFromItem(character, 'fireball');

      expect(result).toBe(false);
    });

    it('should return false for non-existing spell', () => {
      const character = createMockCharacter({
        fireball: LearnedSpell.FromItem,
      });

      const result = hasLearnedFromItem(character, 'unknown-spell');

      expect(result).toBe(false);
    });

    it('should be case sensitive for spell names', () => {
      const character = createMockCharacter({
        heal: LearnedSpell.FromItem,
      });

      expect(hasLearnedFromItem(character, 'heal')).toBe(true);
      expect(hasLearnedFromItem(character, 'HEAL')).toBe(false);
      expect(hasLearnedFromItem(character, 'Heal')).toBe(false);
    });

    it('should handle empty learnedSpells object', () => {
      const character = createMockCharacter({});

      const result = hasLearnedFromItem(character, 'heal');

      expect(result).toBe(false);
    });

    it('should handle multiple spells with different states', () => {
      const character = createMockCharacter({
        spell1: LearnedSpell.FromTraits,
        spell2: LearnedSpell.FromItem,
        spell3: LearnedSpell.Unlearned,
      });

      expect(hasLearnedFromItem(character, 'spell1')).toBe(false);
      expect(hasLearnedFromItem(character, 'spell2')).toBe(true);
      expect(hasLearnedFromItem(character, 'spell3')).toBe(false);
    });

    it('should handle undefined spell name', () => {
      const character = createMockCharacter({});

      const result = hasLearnedFromItem(character, undefined as any);

      expect(result).toBe(false); // undefined key returns undefined, which !== LearnedSpell.FromItem
    });

    it('should handle null spell name', () => {
      const character = createMockCharacter({});

      const result = hasLearnedFromItem(character, null as any);

      expect(result).toBe(false); // null key returns undefined, which !== LearnedSpell.FromItem
    });

    it('should handle empty spell name', () => {
      const character = createMockCharacter({
        '': LearnedSpell.FromItem,
      });

      const result = hasLearnedFromItem(character, '');

      expect(result).toBe(true);
    });

    it('should handle spell with special characters', () => {
      const character = createMockCharacter({
        'spell-with-dashes': LearnedSpell.FromItem,
        spell_with_underscores: LearnedSpell.FromItem,
      });

      expect(hasLearnedFromItem(character, 'spell-with-dashes')).toBe(true);
      expect(hasLearnedFromItem(character, 'spell_with_underscores')).toBe(
        true,
      );
    });

    it('should handle undefined learnedSpells', () => {
      const character = { learnedSpells: undefined } as unknown as ICharacter;

      expect(() => hasLearnedFromItem(character, 'spell')).toThrow();
    });

    it('should handle null learnedSpells', () => {
      const character = { learnedSpells: null } as unknown as ICharacter;

      expect(() => hasLearnedFromItem(character, 'spell')).toThrow();
    });
  });

  describe('forceSpellLearnStatus', () => {
    it('should set spell learn status to Learned', () => {
      const character = createMockCharacter({});

      forceSpellLearnStatus(character, 'fireball', LearnedSpell.FromTraits);

      expect(character.learnedSpells['fireball']).toBe(LearnedSpell.FromTraits);
    });

    it('should set spell learn status to FromItem', () => {
      const character = createMockCharacter({});

      forceSpellLearnStatus(character, 'heal', LearnedSpell.FromItem);

      expect(character.learnedSpells['heal']).toBe(LearnedSpell.FromItem);
    });

    it('should set spell learn status to Unlearned', () => {
      const character = createMockCharacter({});

      forceSpellLearnStatus(character, 'fireball', LearnedSpell.Unlearned);

      expect(character.learnedSpells['fireball']).toBe(LearnedSpell.Unlearned);
    });

    it('should overwrite existing spell learn status', () => {
      const character = createMockCharacter({
        fireball: LearnedSpell.FromTraits,
      });

      forceSpellLearnStatus(character, 'fireball', LearnedSpell.FromItem);

      expect(character.learnedSpells['fireball']).toBe(LearnedSpell.FromItem);
    });

    it('should handle case insensitive spell names by converting to lowercase', () => {
      const character = createMockCharacter({});

      forceSpellLearnStatus(character, 'FIREBALL', LearnedSpell.FromTraits);

      expect(character.learnedSpells['fireball']).toBe(LearnedSpell.FromTraits);
      expect(character.learnedSpells['FIREBALL']).toBe(undefined);
    });

    it('should handle mixed case spell names', () => {
      const character = createMockCharacter({});

      forceSpellLearnStatus(character, 'FireBall', LearnedSpell.FromTraits);

      expect(character.learnedSpells['fireball']).toBe(LearnedSpell.FromTraits);
      expect(character.learnedSpells['FireBall']).toBe(undefined);
    });

    it('should handle empty spell name', () => {
      const character = createMockCharacter({});

      forceSpellLearnStatus(character, '', LearnedSpell.FromTraits);

      expect(character.learnedSpells['']).toBe(LearnedSpell.FromTraits);
    });

    it('should handle spell names with spaces', () => {
      const character = createMockCharacter({});

      forceSpellLearnStatus(
        character,
        'Magic Missile',
        LearnedSpell.FromTraits,
      );

      expect(character.learnedSpells['magic missile']).toBe(
        LearnedSpell.FromTraits,
      );
    });

    it('should handle spell names with special characters', () => {
      const character = createMockCharacter({});

      forceSpellLearnStatus(
        character,
        'spell-with-dashes',
        LearnedSpell.FromTraits,
      );
      forceSpellLearnStatus(
        character,
        'spell_with_underscores',
        LearnedSpell.FromItem,
      );

      expect(character.learnedSpells['spell-with-dashes']).toBe(
        LearnedSpell.FromTraits,
      );
      expect(character.learnedSpells['spell_with_underscores']).toBe(
        LearnedSpell.FromItem,
      );
    });

    it('should handle spell names with numbers', () => {
      const character = createMockCharacter({});

      forceSpellLearnStatus(character, 'spell1', LearnedSpell.FromTraits);
      forceSpellLearnStatus(character, '123spell', LearnedSpell.FromItem);

      expect(character.learnedSpells['spell1']).toBe(LearnedSpell.FromTraits);
      expect(character.learnedSpells['123spell']).toBe(LearnedSpell.FromItem);
    });

    it('should handle multiple spell status updates', () => {
      const character = createMockCharacter({});

      forceSpellLearnStatus(character, 'spell1', LearnedSpell.FromTraits);
      forceSpellLearnStatus(character, 'spell2', LearnedSpell.FromItem);
      forceSpellLearnStatus(character, 'spell3', LearnedSpell.Unlearned);

      expect(character.learnedSpells['spell1']).toBe(LearnedSpell.FromTraits);
      expect(character.learnedSpells['spell2']).toBe(LearnedSpell.FromItem);
      expect(character.learnedSpells['spell3']).toBe(LearnedSpell.Unlearned);
    });

    it('should handle undefined spell name', () => {
      const character = createMockCharacter({});

      expect(() =>
        forceSpellLearnStatus(
          character,
          undefined as any,
          LearnedSpell.FromTraits,
        ),
      ).toThrow();
    });

    it('should handle null spell name', () => {
      const character = createMockCharacter({});

      expect(() =>
        forceSpellLearnStatus(character, null as any, LearnedSpell.FromTraits),
      ).toThrow();
    });

    it('should handle undefined character', () => {
      expect(() =>
        forceSpellLearnStatus(
          undefined as any,
          'spell',
          LearnedSpell.FromTraits,
        ),
      ).toThrow();
    });

    it('should handle null character', () => {
      expect(() =>
        forceSpellLearnStatus(null as any, 'spell', LearnedSpell.FromTraits),
      ).toThrow();
    });

    it('should handle character with undefined learnedSpells', () => {
      const character = { learnedSpells: undefined } as unknown as ICharacter;

      expect(() =>
        forceSpellLearnStatus(character, 'spell', LearnedSpell.FromTraits),
      ).toThrow();
    });

    it('should handle character with null learnedSpells', () => {
      const character = { learnedSpells: null } as unknown as ICharacter;

      expect(() =>
        forceSpellLearnStatus(character, 'spell', LearnedSpell.FromTraits),
      ).toThrow();
    });

    it('should preserve other spells when updating one', () => {
      const character = createMockCharacter({
        'existing-spell': LearnedSpell.FromTraits,
        'another-spell': LearnedSpell.FromItem,
      });

      forceSpellLearnStatus(character, 'new-spell', LearnedSpell.Unlearned);

      expect(character.learnedSpells['existing-spell']).toBe(
        LearnedSpell.FromTraits,
      );
      expect(character.learnedSpells['another-spell']).toBe(
        LearnedSpell.FromItem,
      );
      expect(character.learnedSpells['new-spell']).toBe(LearnedSpell.Unlearned);
    });

    it('should handle very long spell names', () => {
      const character = createMockCharacter({});
      const longSpellName = 'a'.repeat(1000);

      forceSpellLearnStatus(character, longSpellName, LearnedSpell.FromTraits);

      expect(character.learnedSpells[longSpellName]).toBe(
        LearnedSpell.FromTraits,
      );
    });
  });

  describe('Integration Tests', () => {
    it('should work together to manage spell learning states', () => {
      const character = createMockCharacter({});

      // Initially no spells are learned
      expect(hasLearned(character, 'fireball')).toBe(false);
      expect(hasLearnedFromItem(character, 'heal')).toBe(false);

      // Force learn some spells
      forceSpellLearnStatus(character, 'fireball', LearnedSpell.FromTraits);
      forceSpellLearnStatus(character, 'heal', LearnedSpell.FromItem);

      // Check states
      expect(learnedState(character, 'fireball')).toBe(LearnedSpell.FromTraits);
      expect(learnedState(character, 'heal')).toBe(LearnedSpell.FromItem);
      expect(hasLearned(character, 'fireball')).toBe(true);
      expect(hasLearned(character, 'heal')).toBe(true);
      expect(hasLearnedFromItem(character, 'fireball')).toBe(false);
      expect(hasLearnedFromItem(character, 'heal')).toBe(true);

      // Change spell states
      forceSpellLearnStatus(character, 'fireball', LearnedSpell.Unlearned);
      forceSpellLearnStatus(character, 'heal', LearnedSpell.FromTraits);

      expect(hasLearned(character, 'fireball')).toBe(false);
      expect(hasLearned(character, 'heal')).toBe(true);
      expect(hasLearnedFromItem(character, 'heal')).toBe(false);
    });

    it('should handle case sensitivity consistently', () => {
      const character = createMockCharacter({});

      // Force learn with mixed case
      forceSpellLearnStatus(character, 'FIREBALL', LearnedSpell.FromTraits);

      // All case variations should work for learnedState and hasLearned
      expect(learnedState(character, 'fireball')).toBe(LearnedSpell.FromTraits);
      expect(learnedState(character, 'FIREBALL')).toBe(LearnedSpell.FromTraits);
      expect(learnedState(character, 'FireBall')).toBe(LearnedSpell.FromTraits);
      expect(hasLearned(character, 'fireball')).toBe(true);
      expect(hasLearned(character, 'FIREBALL')).toBe(true);

      // But hasLearnedFromItem is case sensitive
      expect(hasLearnedFromItem(character, 'fireball')).toBe(false);
      expect(hasLearnedFromItem(character, 'FIREBALL')).toBe(false);
    });

    it('should handle edge cases gracefully', () => {
      const character = createMockCharacter({
        '': LearnedSpell.FromTraits,
        ' ': LearnedSpell.FromItem,
        'normal-spell': LearnedSpell.Unlearned,
      });

      expect(hasLearned(character, '')).toBe(true);
      expect(hasLearnedFromItem(character, ' ')).toBe(true);
      expect(learnedState(character, 'normal-spell')).toBe(
        LearnedSpell.Unlearned,
      );
      expect(hasLearned(character, 'normal-spell')).toBe(false);
    });

    it('should handle spell state transitions', () => {
      const character = createMockCharacter({});

      const spellName = 'test-spell';

      // Start unlearned
      expect(learnedState(character, spellName)).toBe(LearnedSpell.Unlearned);

      // Learn normally
      forceSpellLearnStatus(character, spellName, LearnedSpell.FromTraits);
      expect(hasLearned(character, spellName)).toBe(true);
      expect(hasLearnedFromItem(character, spellName)).toBe(false);

      // Change to from item
      forceSpellLearnStatus(character, spellName, LearnedSpell.FromItem);
      expect(hasLearned(character, spellName)).toBe(true);
      expect(hasLearnedFromItem(character, spellName)).toBe(true);

      // Unlearn
      forceSpellLearnStatus(character, spellName, LearnedSpell.Unlearned);
      expect(hasLearned(character, spellName)).toBe(false);
      expect(hasLearnedFromItem(character, spellName)).toBe(false);
    });
  });
});
