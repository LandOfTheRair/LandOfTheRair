import type { ICharacter, INPC } from '@lotr/interfaces';
import { Hostility } from '@lotr/interfaces';
import { describe, expect, it } from 'vitest';
import { canGainSkillFromTarget } from './interactions';

describe('Interactions Functions', () => {
  const createMockCharacter = (
    hostility?: Hostility,
    owner?: ICharacter,
  ): ICharacter =>
    ({
      uuid: 'test-uuid',
      name: 'Test Character',
      hp: { current: 100, maximum: 100, minimum: 0 },
      ...(hostility !== undefined && { hostility }),
      ...(owner && { owner }),
    }) as any;

  const createMockNPC = (hostility?: Hostility, owner?: ICharacter): INPC =>
    ({
      uuid: 'test-npc-uuid',
      name: 'Test NPC',
      hp: { current: 100, maximum: 100, minimum: 0 },
      ...(hostility !== undefined && { hostility }),
      ...(owner && { owner }),
    }) as any;

  describe('canGainSkillFromTarget', () => {
    it('should return false when target is null', () => {
      const result = canGainSkillFromTarget(null as any);

      expect(result).toBe(false);
    });

    it('should return false when target is undefined', () => {
      const result = canGainSkillFromTarget(undefined as any);

      expect(result).toBe(false);
    });

    it('should return false when target has Never hostility', () => {
      const target = createMockNPC(Hostility.Never);

      const result = canGainSkillFromTarget(target);

      expect(result).toBe(false);
    });

    it('should return false when target has an owner (is a pet)', () => {
      const owner = createMockCharacter();
      const target = createMockNPC(Hostility.Always, owner);

      const result = canGainSkillFromTarget(target);

      expect(result).toBe(false);
    });

    it('should return true when target is a valid hostile NPC', () => {
      const target = createMockNPC(Hostility.Always);

      const result = canGainSkillFromTarget(target);

      expect(result).toBe(true);
    });

    it('should return true when target is a retaliatory NPC', () => {
      const target = createMockNPC(Hostility.OnHit);

      const result = canGainSkillFromTarget(target);

      expect(result).toBe(true);
    });

    it('should return true when target has no hostility property (character)', () => {
      const target = createMockCharacter();

      const result = canGainSkillFromTarget(target);

      expect(result).toBe(true);
    });

    it('should return true when target has undefined hostility', () => {
      const target = createMockNPC();

      const result = canGainSkillFromTarget(target);

      expect(result).toBe(true);
    });

    it('should handle NPC with owner but different hostility', () => {
      const owner = createMockCharacter();
      const target1 = createMockNPC(Hostility.Never, owner);
      const target2 = createMockNPC(Hostility.Always, owner);

      expect(canGainSkillFromTarget(target1)).toBe(false);
      expect(canGainSkillFromTarget(target2)).toBe(false);
    });

    it('should handle different hostility values', () => {
      expect(canGainSkillFromTarget(createMockNPC(Hostility.Never))).toBe(
        false,
      );
      expect(canGainSkillFromTarget(createMockNPC(Hostility.OnHit))).toBe(true);
      expect(canGainSkillFromTarget(createMockNPC(Hostility.Always))).toBe(
        true,
      );
    });

    it('should prioritize owner check over hostility check', () => {
      const owner = createMockCharacter();
      const target = createMockNPC(Hostility.Always, owner);

      const result = canGainSkillFromTarget(target);

      expect(result).toBe(false);
    });

    it('should handle edge case with empty object', () => {
      const target = {} as ICharacter;

      const result = canGainSkillFromTarget(target);

      expect(result).toBe(true);
    });
  });
});
