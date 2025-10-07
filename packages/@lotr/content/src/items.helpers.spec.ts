import { ItemClass, Skill } from '@lotr/interfaces';
import { describe, expect, it } from 'vitest';
import { getHandsItem } from './items.helpers';

describe('Items Helpers', () => {
  describe('getHandsItem', () => {
    it('should return hands item with correct structure', () => {
      const handsItem = getHandsItem();

      expect(handsItem).toEqual({
        name: 'hands',
        uuid: 'hands',
        mods: {
          itemClass: ItemClass.Hands,
          type: Skill.Martial,
          tier: 1,
          condition: 20000,
        },
      });
    });

    it('should have correct item class', () => {
      const handsItem = getHandsItem();

      expect(handsItem.mods.itemClass).toBe(ItemClass.Hands);
    });

    it('should have correct skill type', () => {
      const handsItem = getHandsItem();

      expect(handsItem.mods.type).toBe(Skill.Martial);
    });

    it('should have tier 1', () => {
      const handsItem = getHandsItem();

      expect(handsItem.mods.tier).toBe(1);
    });

    it('should have condition value of 20000', () => {
      const handsItem = getHandsItem();

      expect(handsItem.mods.condition).toBe(20000);
    });

    it('should have uuid matching name', () => {
      const handsItem = getHandsItem();

      expect(handsItem.uuid).toBe(handsItem.name);
      expect(handsItem.uuid).toBe('hands');
    });

    it('should return consistent results on multiple calls', () => {
      const handsItem1 = getHandsItem();
      const handsItem2 = getHandsItem();

      expect(handsItem1).toEqual(handsItem2);
      expect(handsItem1.name).toBe(handsItem2.name);
      expect(handsItem1.uuid).toBe(handsItem2.uuid);
      expect(handsItem1.mods).toEqual(handsItem2.mods);
    });

    it('should return new object instances on each call', () => {
      const handsItem1 = getHandsItem();
      const handsItem2 = getHandsItem();

      // Objects should not be the same reference
      expect(handsItem1).not.toBe(handsItem2);
      expect(handsItem1.mods).not.toBe(handsItem2.mods);
    });

    it('should have immutable-safe mods object', () => {
      const handsItem = getHandsItem();
      const originalTier = handsItem.mods.tier;

      // Modifying the returned object should not affect subsequent calls
      handsItem.mods.tier = 999;

      const newHandsItem = getHandsItem();
      expect(newHandsItem.mods.tier).toBe(originalTier);
      expect(newHandsItem.mods.tier).toBe(1);
    });

    it('should contain all required mods properties', () => {
      const handsItem = getHandsItem();

      expect(handsItem.mods).toHaveProperty('itemClass');
      expect(handsItem.mods).toHaveProperty('type');
      expect(handsItem.mods).toHaveProperty('tier');
      expect(handsItem.mods).toHaveProperty('condition');
    });

    it('should have numeric values for tier and condition', () => {
      const handsItem = getHandsItem();

      expect(typeof handsItem.mods.tier).toBe('number');
      expect(typeof handsItem.mods.condition).toBe('number');
      expect(handsItem.mods.tier).toBeGreaterThan(0);
      expect(handsItem.mods.condition).toBeGreaterThan(0);
    });

    it('should have string values for name and uuid', () => {
      const handsItem = getHandsItem();

      expect(typeof handsItem.name).toBe('string');
      expect(typeof handsItem.uuid).toBe('string');
      expect(handsItem.name.length).toBeGreaterThan(0);
      expect(handsItem.uuid.length).toBeGreaterThan(0);
    });

    it('should have enum values for itemClass and type', () => {
      const handsItem = getHandsItem();

      // Verify that the values are valid enum members
      expect(Object.values(ItemClass)).toContain(handsItem.mods.itemClass);
      expect(Object.values(Skill)).toContain(handsItem.mods.type);
    });

    it('should create valid default weapon item', () => {
      const handsItem = getHandsItem();

      // Verify it represents a basic melee weapon (hands/unarmed)
      expect(handsItem.name).toBe('hands');
      expect(handsItem.mods.itemClass).toBe(ItemClass.Hands);
      expect(handsItem.mods.type).toBe(Skill.Martial);

      // Verify reasonable default values
      expect(handsItem.mods.tier).toBe(1); // Starting tier
      expect(handsItem.mods.condition).toBe(20000); // High durability
    });

    it('should be suitable for combat calculations', () => {
      const handsItem = getHandsItem();

      // Verify the item has properties needed for combat
      expect(handsItem.mods.tier).toBeGreaterThanOrEqual(1);
      expect(handsItem.mods.condition).toBeGreaterThan(0);
      expect(handsItem.mods.type).toBe(Skill.Martial);
    });

    it('should represent unarmed combat item', () => {
      const handsItem = getHandsItem();

      // This should be the default "weapon" when no weapon is equipped
      expect(handsItem.name).toBe('hands');
      expect(handsItem.uuid).toBe('hands');
      expect(handsItem.mods.itemClass).toBe(ItemClass.Hands);
    });

    it('should have proper object structure for game mechanics', () => {
      const handsItem = getHandsItem();

      // Verify the structure matches expected item format
      expect(handsItem).toHaveProperty('name');
      expect(handsItem).toHaveProperty('uuid');
      expect(handsItem).toHaveProperty('mods');

      // Verify mods contains expected combat properties
      const { mods } = handsItem;
      expect(mods).toHaveProperty('itemClass');
      expect(mods).toHaveProperty('type');
      expect(mods).toHaveProperty('tier');
      expect(mods).toHaveProperty('condition');
    });
  });
});
