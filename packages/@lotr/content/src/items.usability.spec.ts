import type { ICharacter, IPlayer, ISimpleItem } from '@lotr/interfaces';
import { Alignment, Allegiance, BaseClass } from '@lotr/interfaces';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  itemCanGetBenefitsFrom,
  itemIsBroken,
  itemIsOwnedAndUnbroken,
  itemIsOwnedBy,
  itemSetOwner,
} from './items.usability';

// Mock dependencies
vi.mock('./items.properties', () => ({
  itemPropertyGet: vi.fn(),
  itemPropertySet: vi.fn(),
}));

describe('Items Usability Functions', () => {
  let mockItemPropertyGet: any;
  let mockItemPropertySet: any;
  let mockPlayer: IPlayer;
  let mockCharacter: ICharacter;
  let mockItem: ISimpleItem;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();

    const itemPropertiesModule = await import('./items.properties');
    mockItemPropertyGet = vi.mocked(itemPropertiesModule.itemPropertyGet);
    mockItemPropertySet = vi.mocked(itemPropertiesModule.itemPropertySet);

    // Create mock player
    mockPlayer = {
      uuid: 'test-player-uuid',
      username: 'TestPlayer',
      allegiance: Allegiance.None,
      alignment: Alignment.Neutral,
      baseClass: BaseClass.Traveller,
      level: 10,
    } as IPlayer;

    // Create mock character
    mockCharacter = {
      uuid: 'test-character-uuid',
      allegiance: Allegiance.None,
      alignment: Alignment.Neutral,
      baseClass: BaseClass.Traveller,
      level: 10,
    } as ICharacter;

    // Create mock item
    mockItem = {
      name: 'Test Item',
      mods: {},
    } as ISimpleItem;
  });

  describe('itemSetOwner', () => {
    it('should set the owner property of an item to the player username', () => {
      itemSetOwner(mockPlayer, mockItem);

      expect(mockItemPropertySet).toHaveBeenCalledWith(
        mockItem,
        'owner',
        'TestPlayer',
      );
    });

    it('should work with different player usernames', () => {
      const player2 = { ...mockPlayer, username: 'AnotherPlayer' };

      itemSetOwner(player2, mockItem);

      expect(mockItemPropertySet).toHaveBeenCalledWith(
        mockItem,
        'owner',
        'AnotherPlayer',
      );
    });

    it('should handle players with special characters in username', () => {
      const specialPlayer = { ...mockPlayer, username: 'Player_123-Special!' };

      itemSetOwner(specialPlayer, mockItem);

      expect(mockItemPropertySet).toHaveBeenCalledWith(
        mockItem,
        'owner',
        'Player_123-Special!',
      );
    });

    it('should call itemPropertySet exactly once', () => {
      itemSetOwner(mockPlayer, mockItem);

      expect(mockItemPropertySet).toHaveBeenCalledTimes(1);
    });
  });

  describe('itemIsBroken', () => {
    it('should return true when condition is 0', () => {
      mockItemPropertyGet.mockReturnValue(0);

      const result = itemIsBroken(mockItem);

      expect(mockItemPropertyGet).toHaveBeenCalledWith(mockItem, 'condition');
      expect(result).toBe(true);
    });

    it('should return true when condition is negative', () => {
      mockItemPropertyGet.mockReturnValue(-5);

      const result = itemIsBroken(mockItem);

      expect(result).toBe(true);
    });

    it('should return false when condition is positive', () => {
      mockItemPropertyGet.mockReturnValue(100);

      const result = itemIsBroken(mockItem);

      expect(result).toBe(false);
    });

    it('should return false when condition is 1', () => {
      mockItemPropertyGet.mockReturnValue(1);

      const result = itemIsBroken(mockItem);

      expect(result).toBe(false);
    });

    it('should handle fractional condition values', () => {
      mockItemPropertyGet.mockReturnValue(0.5);

      const result = itemIsBroken(mockItem);

      expect(result).toBe(false);
    });

    it('should handle very small positive condition values', () => {
      mockItemPropertyGet.mockReturnValue(0.001);

      const result = itemIsBroken(mockItem);

      expect(result).toBe(false);
    });

    it('should call itemPropertyGet with correct parameters', () => {
      mockItemPropertyGet.mockReturnValue(50);

      itemIsBroken(mockItem);

      expect(mockItemPropertyGet).toHaveBeenCalledWith(mockItem, 'condition');
      expect(mockItemPropertyGet).toHaveBeenCalledTimes(1);
    });
  });

  describe('itemIsOwnedBy', () => {
    describe('when item has no mods', () => {
      it('should return true when item.mods is undefined', () => {
        const itemWithoutMods = { ...mockItem };
        delete (itemWithoutMods as any).mods;

        const result = itemIsOwnedBy(mockCharacter, itemWithoutMods);

        expect(result).toBe(true);
      });
    });

    describe('when item has mods but no owner', () => {
      it('should return true when item.mods.owner is undefined', () => {
        const itemWithMods = { ...mockItem, mods: {} };

        const result = itemIsOwnedBy(mockCharacter, itemWithMods);

        expect(result).toBe(true);
      });

      it('should return true when item.mods.owner is empty string', () => {
        const itemWithMods = { ...mockItem, mods: { owner: '' } };

        const result = itemIsOwnedBy(mockCharacter, itemWithMods);

        expect(result).toBe(true);
      });
    });

    describe('when item has owner', () => {
      it('should return true when character username matches item owner', () => {
        const playerCharacter = mockPlayer;
        const ownedItem = {
          ...mockItem,
          mods: { owner: 'TestPlayer' },
        };

        const result = itemIsOwnedBy(playerCharacter, ownedItem);

        expect(result).toBe(true);
      });

      it('should return false when character username does not match item owner', () => {
        const playerCharacter = mockPlayer;
        const ownedItem = {
          ...mockItem,
          mods: { owner: 'AnotherPlayer' },
        };

        const result = itemIsOwnedBy(playerCharacter, ownedItem);

        expect(result).toBe(false);
      });

      it('should be case sensitive for ownership comparison', () => {
        const playerCharacter = mockPlayer;
        const ownedItem = {
          ...mockItem,
          mods: { owner: 'testplayer' }, // lowercase
        };

        const result = itemIsOwnedBy(playerCharacter, ownedItem);

        expect(result).toBe(false);
      });

      it('should handle special characters in usernames', () => {
        const specialPlayer = { ...mockPlayer, username: 'Player_123!' };
        const ownedItem = {
          ...mockItem,
          mods: { owner: 'Player_123!' },
        };

        const result = itemIsOwnedBy(specialPlayer, ownedItem);

        expect(result).toBe(true);
      });
    });

    describe('edge cases', () => {
      it('should handle NPC characters (no username property)', () => {
        const npcCharacter = { ...mockCharacter }; // NPCs don't have username
        delete (npcCharacter as any).username;

        const ownedItem = {
          ...mockItem,
          mods: { owner: 'SomePlayer' },
        };

        const result = itemIsOwnedBy(npcCharacter, ownedItem);

        expect(result).toBe(false);
      });
    });
  });

  describe('itemIsOwnedAndUnbroken', () => {
    beforeEach(() => {
      mockItemPropertyGet.mockReturnValue(100); // Default to unbroken
    });

    it('should return true when item is owned and unbroken', () => {
      const playerCharacter = mockPlayer;
      const goodItem = { ...mockItem, mods: { owner: 'TestPlayer' } };

      const result = itemIsOwnedAndUnbroken(playerCharacter, goodItem);

      expect(result).toBe(true);
    });

    it('should return false when item is not owned', () => {
      const playerCharacter = mockPlayer;
      const unownedItem = { ...mockItem, mods: { owner: 'AnotherPlayer' } };

      const result = itemIsOwnedAndUnbroken(playerCharacter, unownedItem);

      expect(result).toBe(false);
    });

    it('should return false when item is broken', () => {
      mockItemPropertyGet.mockReturnValue(0); // Broken
      const playerCharacter = mockPlayer;
      const ownedItem = { ...mockItem, mods: { owner: 'TestPlayer' } };

      const result = itemIsOwnedAndUnbroken(playerCharacter, ownedItem);

      expect(result).toBe(false);
    });

    it('should return false when item is not owned and broken', () => {
      mockItemPropertyGet.mockReturnValue(0); // Broken
      const playerCharacter = mockPlayer;
      const badItem = { ...mockItem, mods: { owner: 'AnotherPlayer' } };

      const result = itemIsOwnedAndUnbroken(playerCharacter, badItem);

      expect(result).toBe(false);
    });

    it('should work with unowned item (no mods)', () => {
      const playerCharacter = mockPlayer;
      const unownedItem = { ...mockItem };
      delete (unownedItem as any).mods;

      const result = itemIsOwnedAndUnbroken(playerCharacter, unownedItem);

      expect(result).toBe(true);
    });

    it('should check ownership before checking if broken', () => {
      const playerCharacter = mockPlayer;
      const unownedItem = { ...mockItem, mods: { owner: 'AnotherPlayer' } };

      const result = itemIsOwnedAndUnbroken(playerCharacter, unownedItem);

      // Should return false due to ownership, without checking condition
      expect(result).toBe(false);
      // itemPropertyGet should not be called since ownership check failed
      expect(mockItemPropertyGet).not.toHaveBeenCalled();
    });
  });

  describe('itemCanGetBenefitsFrom', () => {
    beforeEach(() => {
      mockItemPropertyGet.mockImplementation((item, property) => {
        if (property === 'condition') return 100; // Unbroken by default
        if (property === 'requirements') return null; // No requirements by default
        return null;
      });
    });

    describe('basic ownership and condition checks', () => {
      it('should return false when item is not owned', () => {
        const character = mockCharacter;
        const unownedItem = { ...mockItem, mods: { owner: 'AnotherPlayer' } };

        const result = itemCanGetBenefitsFrom(character, unownedItem);

        expect(result).toBe(false);
      });

      it('should return false when item is broken', () => {
        mockItemPropertyGet.mockImplementation((item, property) => {
          if (property === 'condition') return 0; // Broken
          if (property === 'requirements') return null;
          return null;
        });

        const character = mockPlayer;
        const ownedItem = { ...mockItem, mods: { owner: 'TestPlayer' } };

        const result = itemCanGetBenefitsFrom(character, ownedItem);

        expect(result).toBe(false);
      });
    });

    describe('GM allegiance bypass', () => {
      it('should return true for GM regardless of requirements', () => {
        const gmCharacter = { ...mockCharacter, allegiance: Allegiance.GM };
        const restrictedItem = { ...mockItem };
        delete (restrictedItem as any).mods;

        mockItemPropertyGet.mockImplementation((item, property) => {
          if (property === 'condition') {
            return 100;
          }
          if (property === 'requirements') {
            return {
              level: 999,
              baseClass: BaseClass.Mage,
              alignment: Alignment.Evil,
            };
          }
          return null;
        });

        const result = itemCanGetBenefitsFrom(gmCharacter, restrictedItem);

        expect(result).toBe(true);
      });

      it('should return true for GM with ownership and unbroken item', () => {
        const gmCharacter = { ...mockPlayer, allegiance: Allegiance.GM };
        const gmItem = { ...mockItem, mods: { owner: 'TestPlayer' } };

        const result = itemCanGetBenefitsFrom(gmCharacter, gmItem);

        expect(result).toBe(true);
      });
    });

    describe('alignment requirements', () => {
      it('should return false when alignment requirement not met', () => {
        const character = { ...mockPlayer, alignment: Alignment.Neutral };
        const alignedItem = { ...mockItem, mods: { owner: 'TestPlayer' } };

        mockItemPropertyGet.mockImplementation((item, property) => {
          if (property === 'condition') return 100;
          if (property === 'requirements') return { alignment: Alignment.Good };
          return null;
        });

        const result = itemCanGetBenefitsFrom(character, alignedItem);

        expect(result).toBe(false);
      });

      it('should return true when alignment requirement is met', () => {
        const character = { ...mockPlayer, alignment: Alignment.Good };
        const alignedItem = { ...mockItem, mods: { owner: 'TestPlayer' } };

        mockItemPropertyGet.mockImplementation((item, property) => {
          if (property === 'condition') return 100;
          if (property === 'requirements') return { alignment: Alignment.Good };
          return null;
        });

        const result = itemCanGetBenefitsFrom(character, alignedItem);

        expect(result).toBe(true);
      });
    });

    describe('baseClass requirements', () => {
      it('should return false when baseClass requirement not met', () => {
        const character = { ...mockPlayer, baseClass: BaseClass.Traveller };
        const classItem = { ...mockItem, mods: { owner: 'TestPlayer' } };

        mockItemPropertyGet.mockImplementation((item, property) => {
          if (property === 'condition') return 100;
          if (property === 'requirements') return { baseClass: BaseClass.Mage };
          return null;
        });

        const result = itemCanGetBenefitsFrom(character, classItem);

        expect(result).toBe(false);
      });

      it('should return true when baseClass requirement is met', () => {
        const character = { ...mockPlayer, baseClass: BaseClass.Mage };
        const classItem = { ...mockItem, mods: { owner: 'TestPlayer' } };

        mockItemPropertyGet.mockImplementation((item, property) => {
          if (property === 'condition') return 100;
          if (property === 'requirements') return { baseClass: BaseClass.Mage };
          return null;
        });

        const result = itemCanGetBenefitsFrom(character, classItem);

        expect(result).toBe(true);
      });
    });

    describe('level requirements', () => {
      it('should return false when level requirement not met', () => {
        const character = { ...mockPlayer, level: 5 };
        const levelItem = { ...mockItem, mods: { owner: 'TestPlayer' } };

        mockItemPropertyGet.mockImplementation((item, property) => {
          if (property === 'condition') return 100;
          if (property === 'requirements') return { level: 10 };
          return null;
        });

        const result = itemCanGetBenefitsFrom(character, levelItem);

        expect(result).toBe(false);
      });

      it('should return true when level requirement is met exactly', () => {
        const character = { ...mockPlayer, level: 10 };
        const levelItem = { ...mockItem, mods: { owner: 'TestPlayer' } };

        mockItemPropertyGet.mockImplementation((item, property) => {
          if (property === 'condition') return 100;
          if (property === 'requirements') return { level: 10 };
          return null;
        });

        const result = itemCanGetBenefitsFrom(character, levelItem);

        expect(result).toBe(true);
      });

      it('should return true when character level exceeds requirement', () => {
        const character = { ...mockPlayer, level: 15 };
        const levelItem = { ...mockItem, mods: { owner: 'TestPlayer' } };

        mockItemPropertyGet.mockImplementation((item, property) => {
          if (property === 'condition') return 100;
          if (property === 'requirements') return { level: 10 };
          return null;
        });

        const result = itemCanGetBenefitsFrom(character, levelItem);

        expect(result).toBe(true);
      });

      it('should handle edge cases with level 0', () => {
        const character = { ...mockPlayer, level: 0 };
        const levelItem = { ...mockItem, mods: { owner: 'TestPlayer' } };

        mockItemPropertyGet.mockImplementation((item, property) => {
          if (property === 'condition') return 100;
          if (property === 'requirements') return { level: 1 };
          return null;
        });

        const result = itemCanGetBenefitsFrom(character, levelItem);

        expect(result).toBe(false);
      });
    });

    describe('combined requirements', () => {
      it('should return false if any requirement fails', () => {
        const character = {
          ...mockPlayer,
          level: 15,
          alignment: Alignment.Good,
          baseClass: BaseClass.Warrior,
        };
        const restrictedItem = { ...mockItem, mods: { owner: 'TestPlayer' } };

        mockItemPropertyGet.mockImplementation((item, property) => {
          if (property === 'condition') {
            return 100;
          }
          if (property === 'requirements') {
            return {
              level: 10, // Met
              alignment: Alignment.Good, // Met
              baseClass: BaseClass.Mage, // Not met
            };
          }
          return null;
        });

        const result = itemCanGetBenefitsFrom(character, restrictedItem);

        expect(result).toBe(false);
      });

      it('should return true when all requirements are met', () => {
        const character = {
          ...mockPlayer,
          level: 15,
          alignment: Alignment.Good,
          baseClass: BaseClass.Mage,
        };
        const restrictedItem = { ...mockItem, mods: { owner: 'TestPlayer' } };

        mockItemPropertyGet.mockImplementation((item, property) => {
          if (property === 'condition') {
            return 100;
          }
          if (property === 'requirements') {
            return {
              level: 10,
              alignment: Alignment.Good,
              baseClass: BaseClass.Mage,
            };
          }
          return null;
        });

        const result = itemCanGetBenefitsFrom(character, restrictedItem);

        expect(result).toBe(true);
      });
    });

    describe('no requirements', () => {
      it('should return true when item has no requirements', () => {
        const character = mockPlayer;
        const simpleItem = { ...mockItem, mods: { owner: 'TestPlayer' } };

        const result = itemCanGetBenefitsFrom(character, simpleItem);

        expect(result).toBe(true);
      });

      it('should return true when requirements is null', () => {
        const character = mockPlayer;
        const simpleItem = { ...mockItem, mods: { owner: 'TestPlayer' } };

        mockItemPropertyGet.mockImplementation((item, property) => {
          if (property === 'condition') return 100;
          if (property === 'requirements') return null;
          return null;
        });

        const result = itemCanGetBenefitsFrom(character, simpleItem);

        expect(result).toBe(true);
      });

      it('should return true when requirements is undefined', () => {
        const character = mockPlayer;
        const simpleItem = { ...mockItem, mods: { owner: 'TestPlayer' } };

        mockItemPropertyGet.mockImplementation((item, property) => {
          if (property === 'condition') return 100;
          if (property === 'requirements') return undefined;
          return null;
        });

        const result = itemCanGetBenefitsFrom(character, simpleItem);

        expect(result).toBe(true);
      });

      it('should return true when requirements is empty object', () => {
        const character = mockPlayer;
        const simpleItem = { ...mockItem, mods: { owner: 'TestPlayer' } };

        mockItemPropertyGet.mockImplementation((item, property) => {
          if (property === 'condition') return 100;
          if (property === 'requirements') return {};
          return null;
        });

        const result = itemCanGetBenefitsFrom(character, simpleItem);

        expect(result).toBe(true);
      });
    });

    describe('function call order and optimization', () => {
      it('should check ownership/condition before requirements', () => {
        const character = mockPlayer;
        const unownedItem = { ...mockItem, mods: { owner: 'AnotherPlayer' } };

        const result = itemCanGetBenefitsFrom(character, unownedItem);

        expect(result).toBe(false);
        // Should not call itemPropertyGet for requirements since ownership check failed
        expect(mockItemPropertyGet).not.toHaveBeenCalledWith(
          unownedItem,
          'requirements',
        );
      });

      it('should not check GM allegiance if ownership/condition fails', () => {
        const gmCharacter = { ...mockCharacter, allegiance: Allegiance.GM };
        const unownedItem = { ...mockItem, mods: { owner: 'AnotherPlayer' } };

        const result = itemCanGetBenefitsFrom(gmCharacter, unownedItem);

        expect(result).toBe(false);
      });
    });
  });
});
