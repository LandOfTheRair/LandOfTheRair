import type { ICharacter, IStatusEffect, Stat } from '@lotr/interfaces';
import { BuffType, Stat as StatEnum } from '@lotr/interfaces';
import { describe, expect, it } from 'vitest';
import { dispellableEffects, effectStatBonuses } from './removers';

describe('Effect Remover Functions', () => {
  const createMockStatusEffect = (
    effectName: string,
    statChanges?: Partial<Record<Stat, number>>,
    canRemove: boolean = true,
    endsAt: number = Date.now() + 10000,
  ): IStatusEffect =>
    ({
      uuid: `effect-${effectName}-uuid`,
      sourceName: 'Test Source',
      effectName,
      endsAt,
      effectInfo: {
        potency: 100,
        statChanges,
        canRemove,
      },
    }) as IStatusEffect;

  const createMockCharacter = (
    effects: {
      buffs?: IStatusEffect[];
      debuffs?: IStatusEffect[];
      outgoing?: IStatusEffect[];
      incoming?: IStatusEffect[];
      hash?: Record<string, IStatusEffect>;
    } = {},
  ): ICharacter =>
    ({
      uuid: 'char-uuid',
      name: 'Test Character',
      effects: {
        [BuffType.Buff]: effects.buffs || [],
        [BuffType.Debuff]: effects.debuffs || [],
        [BuffType.OutgoingModifier]: effects.outgoing || [],
        [BuffType.IncomingModifier]: effects.incoming || [],
        _hash: effects.hash || {},
      },
    }) as unknown as ICharacter;

  describe('effectStatBonuses', () => {
    it('should return empty object when character has no effects', () => {
      const character = createMockCharacter();

      const result = effectStatBonuses(character);

      expect(result).toEqual({});
    });

    it('should calculate stat bonuses from a single effect', () => {
      const effect = createMockStatusEffect('Strength Boost', {
        [StatEnum.STR]: 10,
        [StatEnum.DEX]: 5,
      });
      const character = createMockCharacter({
        hash: { 'Strength Boost': effect },
      });

      const result = effectStatBonuses(character);

      expect(result).toEqual({
        [StatEnum.STR]: 10,
        [StatEnum.DEX]: 5,
      });
    });

    it('should sum stat bonuses from multiple effects', () => {
      const effect1 = createMockStatusEffect('Strength Boost', {
        [StatEnum.STR]: 10,
        [StatEnum.DEX]: 5,
      });
      const effect2 = createMockStatusEffect('Agility Boost', {
        [StatEnum.DEX]: 8,
        [StatEnum.AGI]: 12,
      });
      const character = createMockCharacter({
        hash: {
          'Strength Boost': effect1,
          'Agility Boost': effect2,
        },
      });

      const result = effectStatBonuses(character);

      expect(result).toEqual({
        [StatEnum.STR]: 10,
        [StatEnum.DEX]: 13, // 5 + 8
        [StatEnum.AGI]: 12,
      });
    });

    it('should handle effects with no stat changes', () => {
      const effect = createMockStatusEffect('No Stats Effect');
      const character = createMockCharacter({
        hash: { 'No Stats Effect': effect },
      });

      const result = effectStatBonuses(character);

      expect(result).toEqual({});
    });

    it('should handle effects with empty stat changes object', () => {
      const effect = createMockStatusEffect('Empty Stats Effect', {});
      const character = createMockCharacter({
        hash: { 'Empty Stats Effect': effect },
      });

      const result = effectStatBonuses(character);

      expect(result).toEqual({});
    });

    it('should handle effects with null stat changes', () => {
      const effect: IStatusEffect = {
        uuid: 'test-uuid',
        sourceName: 'Test Source',
        effectName: 'Null Stats Effect',
        endsAt: Date.now() + 10000,
        effectInfo: {
          potency: 100,
          statChanges: null as any,
        },
      } as IStatusEffect;
      const character = createMockCharacter({
        hash: { 'Null Stats Effect': effect },
      });

      const result = effectStatBonuses(character);

      expect(result).toEqual({});
    });

    it('should handle effects with undefined stat changes', () => {
      const effect: IStatusEffect = {
        uuid: 'test-uuid',
        sourceName: 'Test Source',
        effectName: 'Undefined Stats Effect',
        endsAt: Date.now() + 10000,
        effectInfo: {
          potency: 100,
          statChanges: undefined as any,
        },
      } as IStatusEffect;
      const character = createMockCharacter({
        hash: { 'Undefined Stats Effect': effect },
      });

      const result = effectStatBonuses(character);

      expect(result).toEqual({});
    });

    it('should handle negative stat bonuses', () => {
      const effect = createMockStatusEffect('Debuff Effect', {
        [StatEnum.STR]: -5,
        [StatEnum.DEX]: -3,
      });
      const character = createMockCharacter({
        hash: { 'Debuff Effect': effect },
      });

      const result = effectStatBonuses(character);

      expect(result).toEqual({
        [StatEnum.STR]: -5,
        [StatEnum.DEX]: -3,
      });
    });

    it('should handle zero stat bonuses', () => {
      const effect = createMockStatusEffect('Zero Effect', {
        [StatEnum.STR]: 0,
        [StatEnum.DEX]: 0,
      });
      const character = createMockCharacter({
        hash: { 'Zero Effect': effect },
      });

      const result = effectStatBonuses(character);

      expect(result).toEqual({
        [StatEnum.STR]: 0,
        [StatEnum.DEX]: 0,
      });
    });

    it('should handle fractional stat bonuses', () => {
      const effect = createMockStatusEffect('Fractional Effect', {
        [StatEnum.STR]: 2.5,
        [StatEnum.DEX]: 1.8,
      });
      const character = createMockCharacter({
        hash: { 'Fractional Effect': effect },
      });

      const result = effectStatBonuses(character);

      expect(result).toEqual({
        [StatEnum.STR]: 2.5,
        [StatEnum.DEX]: 1.8,
      });
    });

    it('should handle mixed positive and negative bonuses', () => {
      const effect1 = createMockStatusEffect('Buff', {
        [StatEnum.STR]: 10,
        [StatEnum.DEX]: 5,
      });
      const effect2 = createMockStatusEffect('Debuff', {
        [StatEnum.STR]: -3,
        [StatEnum.WIS]: -8,
      });
      const character = createMockCharacter({
        hash: {
          Buff: effect1,
          Debuff: effect2,
        },
      });

      const result = effectStatBonuses(character);

      expect(result).toEqual({
        [StatEnum.STR]: 7, // 10 + (-3)
        [StatEnum.DEX]: 5,
        [StatEnum.WIS]: -8,
      });
    });

    it('should handle all stat types', () => {
      const effect = createMockStatusEffect('All Stats Effect', {
        [StatEnum.STR]: 1,
        [StatEnum.DEX]: 2,
        [StatEnum.AGI]: 3,
        [StatEnum.INT]: 4,
        [StatEnum.WIS]: 5,
        [StatEnum.WIL]: 6,
        [StatEnum.CHA]: 7,
        [StatEnum.LUK]: 8,
        [StatEnum.CON]: 9,
        [StatEnum.HP]: 10,
        [StatEnum.MP]: 11,
        [StatEnum.HPRegen]: 12,
        [StatEnum.MPRegen]: 13,
      });
      const character = createMockCharacter({
        hash: { 'All Stats Effect': effect },
      });

      const result = effectStatBonuses(character);

      expect(result).toEqual({
        [StatEnum.STR]: 1,
        [StatEnum.DEX]: 2,
        [StatEnum.AGI]: 3,
        [StatEnum.INT]: 4,
        [StatEnum.WIS]: 5,
        [StatEnum.WIL]: 6,
        [StatEnum.CHA]: 7,
        [StatEnum.LUK]: 8,
        [StatEnum.CON]: 9,
        [StatEnum.HP]: 10,
        [StatEnum.MP]: 11,
        [StatEnum.HPRegen]: 12,
        [StatEnum.MPRegen]: 13,
      });
    });

    it('should handle effects with null/undefined individual stat values', () => {
      const effect: IStatusEffect = {
        uuid: 'test-uuid',
        sourceName: 'Test Source',
        effectName: 'Mixed Stats Effect',
        endsAt: Date.now() + 10000,
        effectInfo: {
          potency: 100,
          statChanges: {
            [StatEnum.STR]: 10,
            [StatEnum.DEX]: null as any,
            [StatEnum.AGI]: undefined as any,
            [StatEnum.INT]: 5,
          },
        },
      } as IStatusEffect;
      const character = createMockCharacter({
        hash: { 'Mixed Stats Effect': effect },
      });

      const result = effectStatBonuses(character);

      expect(result).toEqual({
        [StatEnum.STR]: 10,
        [StatEnum.DEX]: 0, // null ?? 0
        [StatEnum.AGI]: 0, // undefined ?? 0
        [StatEnum.INT]: 5,
      });
    });
  });

  describe('dispellableEffects', () => {
    it('should return empty array when character has no buff effects', () => {
      const character = createMockCharacter();

      const result = dispellableEffects(character);

      expect(result).toEqual([]);
    });

    it('should return dispellable buff effects', () => {
      const effect = createMockStatusEffect(
        'Dispellable Buff',
        {},
        true,
        Date.now() + 10000,
      );
      const character = createMockCharacter({
        buffs: [effect],
      });

      const result = dispellableEffects(character);

      expect(result).toHaveLength(1);
      expect(result[0]).toBe(effect);
    });

    it('should filter out permanent effects (endsAt === -1)', () => {
      const permanentEffect = createMockStatusEffect(
        'Permanent Buff',
        {},
        true,
        -1,
      );
      const temporaryEffect = createMockStatusEffect(
        'Temporary Buff',
        {},
        true,
        Date.now() + 10000,
      );
      const character = createMockCharacter({
        buffs: [permanentEffect, temporaryEffect],
      });

      const result = dispellableEffects(character);

      expect(result).toHaveLength(1);
      expect(result[0]).toBe(temporaryEffect);
    });

    it('should filter out non-removable effects', () => {
      const nonRemovableEffect = createMockStatusEffect(
        'Non-Removable Buff',
        {},
        false,
        Date.now() + 10000,
      );
      const removableEffect = createMockStatusEffect(
        'Removable Buff',
        {},
        true,
        Date.now() + 10000,
      );
      const character = createMockCharacter({
        buffs: [nonRemovableEffect, removableEffect],
      });

      const result = dispellableEffects(character);

      expect(result).toHaveLength(1);
      expect(result[0]).toBe(removableEffect);
    });

    it('should filter out both permanent and non-removable effects', () => {
      const permanentEffect = createMockStatusEffect(
        'Permanent Buff',
        {},
        true,
        -1,
      );
      const nonRemovableEffect = createMockStatusEffect(
        'Non-Removable Buff',
        {},
        false,
        Date.now() + 10000,
      );
      const dispellableEffect = createMockStatusEffect(
        'Dispellable Buff',
        {},
        true,
        Date.now() + 10000,
      );
      const character = createMockCharacter({
        buffs: [permanentEffect, nonRemovableEffect, dispellableEffect],
      });

      const result = dispellableEffects(character);

      expect(result).toHaveLength(1);
      expect(result[0]).toBe(dispellableEffect);
    });

    it('should return multiple dispellable effects', () => {
      const effect1 = createMockStatusEffect(
        'Dispellable Buff 1',
        {},
        true,
        Date.now() + 10000,
      );
      const effect2 = createMockStatusEffect(
        'Dispellable Buff 2',
        {},
        true,
        Date.now() + 5000,
      );
      const character = createMockCharacter({
        buffs: [effect1, effect2],
      });

      const result = dispellableEffects(character);

      expect(result).toHaveLength(2);
      expect(result).toContain(effect1);
      expect(result).toContain(effect2);
    });

    it('should only consider buff effects, not debuffs', () => {
      const buffEffect = createMockStatusEffect(
        'Dispellable Buff',
        {},
        true,
        Date.now() + 10000,
      );
      const debuffEffect = createMockStatusEffect(
        'Debuff Effect',
        {},
        true,
        Date.now() + 10000,
      );
      const character = createMockCharacter({
        buffs: [buffEffect],
        debuffs: [debuffEffect],
      });

      const result = dispellableEffects(character);

      expect(result).toHaveLength(1);
      expect(result[0]).toBe(buffEffect);
    });

    it('should only consider buff effects, not outgoing modifiers', () => {
      const buffEffect = createMockStatusEffect(
        'Dispellable Buff',
        {},
        true,
        Date.now() + 10000,
      );
      const outgoingEffect = createMockStatusEffect(
        'Outgoing Effect',
        {},
        true,
        Date.now() + 10000,
      );
      const character = createMockCharacter({
        buffs: [buffEffect],
        outgoing: [outgoingEffect],
      });

      const result = dispellableEffects(character);

      expect(result).toHaveLength(1);
      expect(result[0]).toBe(buffEffect);
    });

    it('should only consider buff effects, not incoming modifiers', () => {
      const buffEffect = createMockStatusEffect(
        'Dispellable Buff',
        {},
        true,
        Date.now() + 10000,
      );
      const incomingEffect = createMockStatusEffect(
        'Incoming Effect',
        {},
        true,
        Date.now() + 10000,
      );
      const character = createMockCharacter({
        buffs: [buffEffect],
        incoming: [incomingEffect],
      });

      const result = dispellableEffects(character);

      expect(result).toHaveLength(1);
      expect(result[0]).toBe(buffEffect);
    });

    it('should handle effects with missing canRemove property (falsy)', () => {
      const effect: IStatusEffect = {
        uuid: 'test-uuid',
        sourceName: 'Test Source',
        effectName: 'Missing CanRemove',
        endsAt: Date.now() + 10000,
        effectInfo: {
          potency: 100,
          // canRemove is missing (undefined)
        },
      } as IStatusEffect;
      const character = createMockCharacter({
        buffs: [effect],
      });

      const result = dispellableEffects(character);

      expect(result).toHaveLength(0);
    });

    it('should handle effects with null canRemove property', () => {
      const effect: IStatusEffect = {
        uuid: 'test-uuid',
        sourceName: 'Test Source',
        effectName: 'Null CanRemove',
        endsAt: Date.now() + 10000,
        effectInfo: {
          potency: 100,
          canRemove: null as any,
        },
      } as IStatusEffect;
      const character = createMockCharacter({
        buffs: [effect],
      });

      const result = dispellableEffects(character);

      expect(result).toHaveLength(0);
    });

    it('should handle effects with explicitly false canRemove property', () => {
      const effect = createMockStatusEffect(
        'Explicitly False',
        {},
        false,
        Date.now() + 10000,
      );
      const character = createMockCharacter({
        buffs: [effect],
      });

      const result = dispellableEffects(character);

      expect(result).toHaveLength(0);
    });

    it('should handle zero endsAt time', () => {
      const effect = createMockStatusEffect('Zero End Time', {}, true, 0);
      const character = createMockCharacter({
        buffs: [effect],
      });

      const result = dispellableEffects(character);

      expect(result).toHaveLength(1);
      expect(result[0]).toBe(effect);
    });

    it('should handle negative endsAt time (but not -1)', () => {
      const effect = createMockStatusEffect(
        'Negative End Time',
        {},
        true,
        -100,
      );
      const character = createMockCharacter({
        buffs: [effect],
      });

      const result = dispellableEffects(character);

      expect(result).toHaveLength(1);
      expect(result[0]).toBe(effect);
    });
  });

  describe('Integration Tests', () => {
    it('should work together with complex effect scenarios', () => {
      const strengthBuff = createMockStatusEffect(
        'Strength Buff',
        {
          [StatEnum.STR]: 10,
          [StatEnum.HP]: 50,
        },
        true,
        Date.now() + 10000,
      );

      const permanentAura = createMockStatusEffect(
        'Permanent Aura',
        {
          [StatEnum.WIS]: 5,
          [StatEnum.MP]: 25,
        },
        true,
        -1,
      );

      const nonRemovableDebuff = createMockStatusEffect(
        'Cursed',
        {
          [StatEnum.DEX]: -3,
        },
        false,
        Date.now() + 5000,
      );

      const character = createMockCharacter({
        buffs: [strengthBuff, permanentAura],
        debuffs: [nonRemovableDebuff],
        hash: {
          'Strength Buff': strengthBuff,
          'Permanent Aura': permanentAura,
          Cursed: nonRemovableDebuff,
        },
      });

      // Test effectStatBonuses includes all effects
      const statBonuses = effectStatBonuses(character);
      expect(statBonuses).toEqual({
        [StatEnum.STR]: 10,
        [StatEnum.HP]: 50,
        [StatEnum.WIS]: 5,
        [StatEnum.MP]: 25,
        [StatEnum.DEX]: -3,
      });

      // Test dispellableEffects only includes the removable, temporary buff
      const dispellable = dispellableEffects(character);
      expect(dispellable).toHaveLength(1);
      expect(dispellable[0]).toBe(strengthBuff);
    });

    it('should handle empty character effects consistently', () => {
      const character = createMockCharacter();

      const statBonuses = effectStatBonuses(character);
      const dispellable = dispellableEffects(character);

      expect(statBonuses).toEqual({});
      expect(dispellable).toEqual([]);
    });
  });
});
