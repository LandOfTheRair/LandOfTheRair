import type { ICharacter, INPC } from '@lotr/interfaces';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { addPet, isPet, removePet } from './pet';

describe('Pet Functions', () => {
  const createMockCharacter = (
    uuid = 'test-uuid',
    pets: INPC[] = [],
  ): ICharacter =>
    ({
      uuid,
      pets,
    }) as unknown as ICharacter;

  const createMockNPC = (uuid = 'npc-uuid', owner?: ICharacter): INPC =>
    ({
      uuid,
      owner,
      npcId: 'test-npc',
      sprite: 0,
      usableSkills: [],
      skillOnKill: 0,
      maxWanderDistance: 0,
      spawnMessage: '',
      sfx: {},
    }) as unknown as INPC;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('isPet', () => {
    it('should return true when character has owner property', () => {
      const owner = createMockCharacter('owner-uuid');
      const pet = createMockNPC('pet-uuid', owner);

      const result = isPet(pet);

      expect(result).toBe(true);
    });

    it('should return false when character has no owner property', () => {
      const npc = createMockNPC('npc-uuid');

      const result = isPet(npc);

      expect(result).toBe(false);
    });

    it('should return false when owner property is undefined', () => {
      const npc = createMockNPC('npc-uuid', undefined);

      const result = isPet(npc);

      expect(result).toBe(false);
    });

    it('should return false when owner property is null', () => {
      const npc = createMockNPC('npc-uuid', null as any);

      const result = isPet(npc);

      expect(result).toBe(false);
    });

    it('should return true when owner property is any truthy value', () => {
      const owner = createMockCharacter('owner-uuid');
      const pet = createMockNPC('pet-uuid', owner);

      const result = isPet(pet);

      expect(result).toBe(true);
    });

    it('should handle character that is not an NPC', () => {
      const character = createMockCharacter('char-uuid');

      const result = isPet(character);

      expect(result).toBe(false); // No owner property
    });

    it('should handle undefined character', () => {
      expect(() => isPet(undefined as any)).toThrow();
    });

    it('should handle null character', () => {
      expect(() => isPet(null as any)).toThrow();
    });

    it('should handle empty object', () => {
      const result = isPet({} as ICharacter);

      expect(result).toBe(false);
    });

    it('should return true for character with owner property even if pets array exists', () => {
      const owner = createMockCharacter('owner-uuid');
      const pet = createMockNPC('pet-uuid', owner);
      // Add pets array to simulate a pet that also has pets
      (pet as any).pets = [];

      const result = isPet(pet);

      expect(result).toBe(true);
    });
  });

  describe('addPet', () => {
    it('should set owner property on pet', () => {
      const owner = createMockCharacter('owner-uuid');
      const pet = createMockNPC('pet-uuid');

      addPet(owner, pet);

      expect(pet.owner).toBe(owner);
    });

    it('should add pet to owner pets array', () => {
      const owner = createMockCharacter('owner-uuid', []);
      const pet = createMockNPC('pet-uuid');

      addPet(owner, pet);

      expect(owner.pets).toHaveLength(1);
      expect(owner.pets![0]).toBe(pet);
    });

    it('should initialize pets array if undefined', () => {
      const owner = createMockCharacter('owner-uuid');
      delete (owner as any).pets; // Remove pets property
      const pet = createMockNPC('pet-uuid');

      addPet(owner, pet);

      expect(owner.pets).toHaveLength(1);
      expect(owner.pets![0]).toBe(pet);
    });

    it('should initialize pets array if null', () => {
      const owner = createMockCharacter('owner-uuid');
      (owner as any).pets = null;
      const pet = createMockNPC('pet-uuid');

      addPet(owner, pet);

      expect(owner.pets).toHaveLength(1);
      expect(owner.pets![0]).toBe(pet);
    });

    it('should add multiple pets to existing array', () => {
      const owner = createMockCharacter('owner-uuid', []);
      const pet1 = createMockNPC('pet-1');
      const pet2 = createMockNPC('pet-2');

      addPet(owner, pet1);
      addPet(owner, pet2);

      expect(owner.pets).toHaveLength(2);
      expect(owner.pets![0]).toBe(pet1);
      expect(owner.pets![1]).toBe(pet2);
      expect(pet1.owner).toBe(owner);
      expect(pet2.owner).toBe(owner);
    });

    it('should handle adding same pet multiple times', () => {
      const owner = createMockCharacter('owner-uuid', []);
      const pet = createMockNPC('pet-uuid');

      addPet(owner, pet);
      addPet(owner, pet);

      expect(owner.pets).toHaveLength(2);
      expect(owner.pets![0]).toBe(pet);
      expect(owner.pets![1]).toBe(pet);
      expect(pet.owner).toBe(owner);
    });

    it('should overwrite previous owner', () => {
      const oldOwner = createMockCharacter('old-owner');
      const newOwner = createMockCharacter('new-owner');
      const pet = createMockNPC('pet-uuid', oldOwner);

      addPet(newOwner, pet);

      expect(pet.owner).toBe(newOwner);
      expect(pet.owner).not.toBe(oldOwner);
    });

    it('should handle undefined pet', () => {
      const owner = createMockCharacter('owner-uuid', []);

      expect(() => addPet(owner, undefined as any)).toThrow();
    });

    it('should handle null pet', () => {
      const owner = createMockCharacter('owner-uuid', []);

      expect(() => addPet(owner, null as any)).toThrow();
    });

    it('should handle undefined owner', () => {
      const pet = createMockNPC('pet-uuid');

      expect(() => addPet(undefined as any, pet)).toThrow();
    });

    it('should handle null owner', () => {
      const pet = createMockNPC('pet-uuid');

      expect(() => addPet(null as any, pet)).toThrow();
    });
  });

  describe('removePet', () => {
    it('should remove owner property from pet', () => {
      const owner = createMockCharacter('owner-uuid');
      const pet = createMockNPC('pet-uuid', owner);

      removePet(owner, pet);

      expect(pet.owner).toBe(undefined);
    });

    it('should remove pet from owner pets array', () => {
      const pet1 = createMockNPC('pet-1');
      const pet2 = createMockNPC('pet-2');
      const owner = createMockCharacter('owner-uuid', [pet1, pet2]);

      removePet(owner, pet1);

      expect(owner.pets).toHaveLength(1);
      expect(owner.pets![0]).toBe(pet2);
      expect(owner.pets).not.toContain(pet1);
    });

    it('should handle removing pet not in array', () => {
      const pet1 = createMockNPC('pet-1');
      const pet2 = createMockNPC('pet-2');
      const notPet = createMockNPC('not-pet');
      const owner = createMockCharacter('owner-uuid', [pet1, pet2]);

      removePet(owner, notPet);

      expect(owner.pets).toHaveLength(2);
      expect(owner.pets![0]).toBe(pet1);
      expect(owner.pets![1]).toBe(pet2);
      expect(notPet.owner).toBe(undefined);
    });

    it('should handle removing from empty pets array', () => {
      const pet = createMockNPC('pet-uuid');
      const owner = createMockCharacter('owner-uuid', []);

      removePet(owner, pet);

      expect(owner.pets).toHaveLength(0);
      expect(pet.owner).toBe(undefined);
    });

    it('should initialize pets array if undefined', () => {
      const owner = createMockCharacter('owner-uuid');
      delete (owner as any).pets;
      const pet = createMockNPC('pet-uuid');

      removePet(owner, pet);

      expect(owner.pets).toHaveLength(0);
      expect(pet.owner).toBe(undefined);
    });

    it('should initialize pets array if null', () => {
      const owner = createMockCharacter('owner-uuid');
      (owner as any).pets = null;
      const pet = createMockNPC('pet-uuid');

      removePet(owner, pet);

      expect(owner.pets).toHaveLength(0);
      expect(pet.owner).toBe(undefined);
    });

    it('should remove all occurrences of duplicate pets', () => {
      const pet = createMockNPC('pet-uuid');
      const owner = createMockCharacter('owner-uuid', [pet, pet, pet]);

      removePet(owner, pet);

      expect(owner.pets).toHaveLength(0);
      expect(pet.owner).toBe(undefined);
    });

    it('should handle removing last pet', () => {
      const pet = createMockNPC('pet-uuid');
      const owner = createMockCharacter('owner-uuid', [pet]);

      removePet(owner, pet);

      expect(owner.pets).toHaveLength(0);
      expect(pet.owner).toBe(undefined);
    });

    it('should handle undefined pet', () => {
      const pet1 = createMockNPC('pet-1');
      const owner = createMockCharacter('owner-uuid', [pet1]);

      expect(() => removePet(owner, undefined as any)).toThrow();
    });

    it('should handle null pet', () => {
      const pet1 = createMockNPC('pet-1');
      const owner = createMockCharacter('owner-uuid', [pet1]);

      expect(() => removePet(owner, null as any)).toThrow();
    });

    it('should handle undefined owner', () => {
      const pet = createMockNPC('pet-uuid');

      expect(() => removePet(undefined as any, pet)).toThrow();
    });

    it('should handle null owner', () => {
      const pet = createMockNPC('pet-uuid');

      expect(() => removePet(null as any, pet)).toThrow();
    });
  });

  describe('Integration Tests', () => {
    it('should work with addPet and isPet', () => {
      const owner = createMockCharacter('owner-uuid', []);
      const pet = createMockNPC('pet-uuid');

      expect(isPet(pet)).toBe(false);

      addPet(owner, pet);

      expect(isPet(pet)).toBe(true);
    });

    it('should work with addPet and removePet', () => {
      const owner = createMockCharacter('owner-uuid', []);
      const pet = createMockNPC('pet-uuid');

      addPet(owner, pet);
      expect(owner.pets).toHaveLength(1);
      expect(isPet(pet)).toBe(true);

      removePet(owner, pet);
      expect(owner.pets).toHaveLength(0);
      expect(isPet(pet)).toBe(false);
    });

    it('should work with all three functions together', () => {
      const owner = createMockCharacter('owner-uuid', []);
      const pet1 = createMockNPC('pet-1');
      const pet2 = createMockNPC('pet-2');

      // Start with no pets
      expect(isPet(pet1)).toBe(false);
      expect(isPet(pet2)).toBe(false);

      // Add pets
      addPet(owner, pet1);
      addPet(owner, pet2);

      expect(isPet(pet1)).toBe(true);
      expect(isPet(pet2)).toBe(true);
      expect(owner.pets).toHaveLength(2);

      // Remove one pet
      removePet(owner, pet1);

      expect(isPet(pet1)).toBe(false);
      expect(isPet(pet2)).toBe(true);
      expect(owner.pets).toHaveLength(1);

      // Remove last pet
      removePet(owner, pet2);

      expect(isPet(pet1)).toBe(false);
      expect(isPet(pet2)).toBe(false);
      expect(owner.pets).toHaveLength(0);
    });

    it('should handle complex pet management scenario', () => {
      const owner1 = createMockCharacter('owner-1', []);
      const owner2 = createMockCharacter('owner-2', []);
      const pet1 = createMockNPC('pet-1');
      const pet2 = createMockNPC('pet-2');

      // Add pets to first owner
      addPet(owner1, pet1);
      addPet(owner1, pet2);

      expect(isPet(pet1)).toBe(true);
      expect(isPet(pet2)).toBe(true);
      expect(pet1.owner).toBe(owner1);
      expect(pet2.owner).toBe(owner1);
      expect(owner1.pets).toHaveLength(2);

      // Transfer pet1 to second owner
      addPet(owner2, pet1);

      expect(pet1.owner).toBe(owner2); // Owner changed
      expect(pet2.owner).toBe(owner1); // Unchanged
      expect(owner1.pets).toHaveLength(2); // Still contains pet1
      expect(owner2.pets).toHaveLength(1); // Now contains pet1

      // Remove pet1 from original owner
      removePet(owner1, pet1);

      expect(owner1.pets).toHaveLength(1); // Only pet2
      expect(owner2.pets).toHaveLength(1); // Still pet1
      expect(pet1.owner).toBe(undefined); // Owner removed
    });
  });
});
