import type { IStatusEffectData } from '@lotr/interfaces';
import { describe, expect, it } from 'vitest';
import { formatEffectMessage } from './formatters';

describe('formatEffectMessage', () => {
  const createMockEffectData = (potency: number): IStatusEffectData =>
    ({
      tooltip: {
        name: 'Test Effect',
        desc: 'Test Description',
      },
      effect: {
        type: 'buff',
        duration: 100,
        extra: {
          potency,
        },
      },
      effectMeta: {},
    }) as IStatusEffectData;

  describe('Basic Functionality', () => {
    it('should replace %potency with the potency value', () => {
      const effectData = createMockEffectData(25);
      const message = 'Effect deals %potency damage';

      const result = formatEffectMessage(message, effectData);

      expect(result).toBe('Effect deals 25 damage');
    });

    it('should replace %potency5 with potency divided by 5', () => {
      const effectData = createMockEffectData(25);
      const message = 'Effect heals %potency5 health';

      const result = formatEffectMessage(message, effectData);

      expect(result).toBe('Effect heals 5 health');
    });

    it('should replace %potency10 with potency divided by 10', () => {
      const effectData = createMockEffectData(50);
      const message = 'Effect grants %potency10 bonus';

      const result = formatEffectMessage(message, effectData);

      expect(result).toBe('Effect grants 5 bonus');
    });

    it('should replace multiple different placeholders in one message', () => {
      const effectData = createMockEffectData(100);
      const message =
        'Effect deals %potency damage, heals %potency5 health, grants %potency10 bonus';

      const result = formatEffectMessage(message, effectData);

      expect(result).toBe(
        'Effect deals 100 damage, heals 20 health, grants 10 bonus',
      );
    });

    it('should replace multiple instances of the same placeholder', () => {
      const effectData = createMockEffectData(30);
      const message = 'Effect deals %potency damage and %potency extra damage';

      const result = formatEffectMessage(message, effectData);

      expect(result).toBe('Effect deals 30 damage and 30 extra damage');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty message', () => {
      const effectData = createMockEffectData(25);
      const message = '';

      const result = formatEffectMessage(message, effectData);

      expect(result).toBe('');
    });

    it('should handle null message by treating it as empty string', () => {
      const effectData = createMockEffectData(25);
      const message = null as any;

      const result = formatEffectMessage(message, effectData);

      expect(result).toBe('');
    });

    it('should handle undefined message by treating it as empty string', () => {
      const effectData = createMockEffectData(25);
      const message = undefined as any;

      const result = formatEffectMessage(message, effectData);

      expect(result).toBe('');
    });

    it('should handle message with no placeholders', () => {
      const effectData = createMockEffectData(25);
      const message = 'This is a plain message';

      const result = formatEffectMessage(message, effectData);

      expect(result).toBe('This is a plain message');
    });

    it('should handle zero potency', () => {
      const effectData = createMockEffectData(0);
      const message =
        'Effect deals %potency damage, heals %potency5 health, grants %potency10 bonus';

      const result = formatEffectMessage(message, effectData);

      expect(result).toBe(
        'Effect deals 0 damage, heals 0 health, grants 0 bonus',
      );
    });

    it('should handle negative potency by flooring to negative values', () => {
      const effectData = createMockEffectData(-25);
      const message =
        'Effect deals %potency damage, heals %potency5 health, grants %potency10 bonus';

      const result = formatEffectMessage(message, effectData);

      // -25/5 = -5, -25/10 = -2.5 -> Math.floor(-2.5) = -3
      expect(result).toBe(
        'Effect deals -25 damage, heals -5 health, grants -3 bonus',
      );
    });

    it('should handle fractional potency by flooring values', () => {
      const effectData = createMockEffectData(27.8);
      const message =
        'Effect deals %potency damage, heals %potency5 health, grants %potency10 bonus';

      const result = formatEffectMessage(message, effectData);

      expect(result).toBe(
        'Effect deals 27 damage, heals 5 health, grants 2 bonus',
      );
    });

    it('should handle missing potency by treating it as 0', () => {
      const effectData: IStatusEffectData = {
        tooltip: { name: 'Test Effect' },
        effect: {
          type: 'buff',
          duration: 100,
          extra: {}, // No potency property
        },
        effectMeta: {},
      } as IStatusEffectData;

      const message = 'Effect deals %potency damage';

      const result = formatEffectMessage(message, effectData);

      expect(result).toBe('Effect deals 0 damage');
    });

    it('should handle null potency by treating it as 0', () => {
      const effectData: IStatusEffectData = {
        tooltip: { name: 'Test Effect' },
        effect: {
          type: 'buff',
          duration: 100,
          extra: { potency: null as any },
        },
        effectMeta: {},
      } as IStatusEffectData;

      const message = 'Effect deals %potency damage';

      const result = formatEffectMessage(message, effectData);

      expect(result).toBe('Effect deals 0 damage');
    });

    it('should handle undefined potency by treating it as 0', () => {
      const effectData: IStatusEffectData = {
        tooltip: { name: 'Test Effect' },
        effect: {
          type: 'buff',
          duration: 100,
          extra: { potency: undefined as any },
        },
        effectMeta: {},
      } as IStatusEffectData;

      const message = 'Effect deals %potency damage';

      const result = formatEffectMessage(message, effectData);

      expect(result).toBe('Effect deals 0 damage');
    });
  });

  describe('Large Numbers and Formatting', () => {
    it('should format large numbers with locale string formatting', () => {
      const effectData = createMockEffectData(1234567);
      const message = 'Effect deals %potency damage';

      const result = formatEffectMessage(message, effectData);

      expect(result).toBe('Effect deals 1,234,567 damage');
    });

    it('should format large derived values with locale string formatting', () => {
      const effectData = createMockEffectData(123456);
      const message =
        'Effect heals %potency5 health and grants %potency10 bonus';

      const result = formatEffectMessage(message, effectData);

      expect(result).toBe('Effect heals 24,691 health and grants 12,345 bonus');
    });

    it('should handle very large potency values', () => {
      const effectData = createMockEffectData(999999999);
      const message = '%potency/%potency5/%potency10';

      const result = formatEffectMessage(message, effectData);

      expect(result).toBe('999,999,999/199,999,999/99,999,999');
    });
  });

  describe('Replacement Order and Precision', () => {
    it('should replace %potency10 before %potency to avoid conflicts', () => {
      const effectData = createMockEffectData(100);
      const message = '%potency10 and %potency';

      const result = formatEffectMessage(message, effectData);

      expect(result).toBe('10 and 100');
    });

    it('should replace %potency5 before %potency to avoid conflicts', () => {
      const effectData = createMockEffectData(100);
      const message = '%potency5 and %potency';

      const result = formatEffectMessage(message, effectData);

      expect(result).toBe('20 and 100');
    });

    it('should handle division precision correctly with Math.floor', () => {
      const effectData = createMockEffectData(17);
      const message = '%potency5 equals %potency10';

      const result = formatEffectMessage(message, effectData);

      // 17/5 = 3.4 -> floor = 3, 17/10 = 1.7 -> floor = 1
      expect(result).toBe('3 equals 1');
    });

    it('should handle complex replacement patterns', () => {
      const effectData = createMockEffectData(55);
      const message =
        'Base: %potency, Half: %potency5, Tenth: %potency10, Again: %potency';

      const result = formatEffectMessage(message, effectData);

      expect(result).toBe('Base: 55, Half: 11, Tenth: 5, Again: 55');
    });
  });

  describe('Real-world Usage Scenarios', () => {
    it('should handle typical damage effect message', () => {
      const effectData = createMockEffectData(150);
      const message = 'Deals %potency fire damage over time';

      const result = formatEffectMessage(message, effectData);

      expect(result).toBe('Deals 150 fire damage over time');
    });

    it('should handle healing effect with multiple values', () => {
      const effectData = createMockEffectData(80);
      const message =
        'Heals %potency5 health immediately and %potency10 mana per second';

      const result = formatEffectMessage(message, effectData);

      expect(result).toBe('Heals 16 health immediately and 8 mana per second');
    });

    it('should handle buff effect with percentage calculations', () => {
      const effectData = createMockEffectData(250);
      const message =
        'Increases damage by %potency10% and accuracy by %potency5%';

      const result = formatEffectMessage(message, effectData);

      expect(result).toBe('Increases damage by 25% and accuracy by 50%');
    });

    it('should handle complex multi-line effect description', () => {
      const effectData = createMockEffectData(300);
      const message = `Primary Effect: %potency damage
Secondary Effect: %potency5 healing
Tertiary Effect: %potency10 bonus`;

      const result = formatEffectMessage(message, effectData);

      const expected = `Primary Effect: 300 damage
Secondary Effect: 60 healing
Tertiary Effect: 30 bonus`;

      expect(result).toBe(expected);
    });
  });
});
