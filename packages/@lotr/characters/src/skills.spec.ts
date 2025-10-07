import { calcSkillLevelForCharacter } from '@lotr/exp';
import type { ICharacter, Skill } from '@lotr/interfaces';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getSkillLevel } from './skills';
import { getStat } from './stats';

// Mock the dependencies
vi.mock('@lotr/exp', () => ({
  calcSkillLevelForCharacter: vi.fn(),
}));

vi.mock('./stats', () => ({
  getStat: vi.fn(),
}));

describe('Skill Functions', () => {
  const createMockCharacter = (): ICharacter =>
    ({
      uuid: 'test-char',
      name: 'Test Character',
    }) as unknown as ICharacter;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(calcSkillLevelForCharacter).mockReturnValue(10);
    vi.mocked(getStat).mockReturnValue(5);
  });

  describe('getSkillLevel', () => {
    it('should return sum of base skill level and bonus stat', () => {
      const character = createMockCharacter();
      const skill = 'Sword' as Skill;

      const result = getSkillLevel(character, skill);

      expect(result).toBe(15); // 10 (base) + 5 (bonus)
    });

    it('should call calcSkillLevelForCharacter with correct parameters', () => {
      const character = createMockCharacter();
      const skill = 'Dagger' as Skill;

      getSkillLevel(character, skill);

      expect(vi.mocked(calcSkillLevelForCharacter)).toHaveBeenCalledWith(
        character,
        skill,
      );
    });

    it('should call getStat with correct parameters', () => {
      const character = createMockCharacter();
      const skill = 'Mace' as Skill;

      getSkillLevel(character, skill);

      expect(vi.mocked(getStat)).toHaveBeenCalledWith(character, 'maceBonus');
    });

    it('should work with different skill names', () => {
      const character = createMockCharacter();
      const skills = ['Sword', 'Dagger', 'Staff', 'Bow'] as unknown as Skill[];

      skills.forEach((skill) => {
        const result = getSkillLevel(character, skill);
        expect(result).toBe(15);
      });
    });

    it('should convert skill name to lowercase for bonus stat', () => {
      const character = createMockCharacter();
      const skill = 'ThrowingWeapon' as Skill;

      getSkillLevel(character, skill);

      expect(vi.mocked(getStat)).toHaveBeenCalledWith(
        character,
        'throwingweaponBonus',
      );
    });

    it('should handle skill names with complex formatting', () => {
      const character = createMockCharacter();
      const complexSkill = 'TwoHanded' as Skill;

      getSkillLevel(character, complexSkill);

      expect(vi.mocked(getStat)).toHaveBeenCalledWith(
        character,
        'twohandedBonus',
      );
    });

    it('should work when base skill level is zero', () => {
      vi.mocked(calcSkillLevelForCharacter).mockReturnValueOnce(0);
      const character = createMockCharacter();
      const skill = 'Sword' as Skill;

      const result = getSkillLevel(character, skill);

      expect(result).toBe(5); // 0 (base) + 5 (bonus)
    });

    it('should work when bonus stat is zero', () => {
      vi.mocked(getStat).mockReturnValueOnce(0);
      const character = createMockCharacter();
      const skill = 'Sword' as Skill;

      const result = getSkillLevel(character, skill);

      expect(result).toBe(10); // 10 (base) + 0 (bonus)
    });

    it('should handle negative base skill levels', () => {
      vi.mocked(calcSkillLevelForCharacter).mockReturnValueOnce(-3);
      const character = createMockCharacter();
      const skill = 'Sword' as Skill;

      const result = getSkillLevel(character, skill);

      expect(result).toBe(2); // -3 (base) + 5 (bonus)
    });

    it('should handle negative bonus stats', () => {
      vi.mocked(getStat).mockReturnValueOnce(-2);
      const character = createMockCharacter();
      const skill = 'Sword' as Skill;

      const result = getSkillLevel(character, skill);

      expect(result).toBe(8); // 10 (base) + (-2) (bonus)
    });

    it('should handle large skill values', () => {
      vi.mocked(calcSkillLevelForCharacter).mockReturnValueOnce(999);
      vi.mocked(getStat).mockReturnValueOnce(100);
      const character = createMockCharacter();
      const skill = 'Sword' as Skill;

      const result = getSkillLevel(character, skill);

      expect(result).toBe(1099);
    });
  });
});
