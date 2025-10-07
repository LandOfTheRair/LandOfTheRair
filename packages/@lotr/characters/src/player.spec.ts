import type { ICharacter, IPlayer } from '@lotr/interfaces';
import { describe, expect, it } from 'vitest';
import { isPlayer } from './player';

describe('Player Functions', () => {
  const createMockPlayer = (username?: string): IPlayer =>
    ({
      username,
    }) as unknown as IPlayer;

  const createMockCharacter = (): ICharacter =>
    ({
      uuid: 'npc-uuid',
      name: 'Test NPC',
    }) as unknown as ICharacter;

  describe('isPlayer', () => {
    it('should return true when character has a username', () => {
      const player = createMockPlayer('testuser');

      const result = isPlayer(player);

      expect(result).toBe(true);
    });

    it('should return false when character has no username', () => {
      const character = createMockCharacter();

      const result = isPlayer(character);

      expect(result).toBe(false);
    });

    it('should return false when character has undefined username', () => {
      const player = createMockPlayer(undefined);

      const result = isPlayer(player);

      expect(result).toBe(false);
    });

    it('should return false when character has null username', () => {
      const player = createMockPlayer(null as any);

      const result = isPlayer(player);

      expect(result).toBe(false);
    });

    it('should return false when character has empty string username', () => {
      const player = createMockPlayer('');

      const result = isPlayer(player);

      expect(result).toBe(false);
    });

    it('should return true with whitespace-only username', () => {
      const player = createMockPlayer('   ');

      const result = isPlayer(player);

      expect(result).toBe(true);
    });

    it('should return true with single character username', () => {
      const player = createMockPlayer('a');

      const result = isPlayer(player);

      expect(result).toBe(true);
    });

    it('should return true with long username', () => {
      const player = createMockPlayer('verylongusernamethatislongerthanusual');

      const result = isPlayer(player);

      expect(result).toBe(true);
    });

    it('should return true with username containing special characters', () => {
      const player = createMockPlayer('user@123_test');

      const result = isPlayer(player);

      expect(result).toBe(true);
    });

    it('should work correctly when character is cast from ICharacter', () => {
      const character = createMockCharacter();
      (character as any).username = 'testuser';

      const result = isPlayer(character);

      expect(result).toBe(true);
    });
  });
});
