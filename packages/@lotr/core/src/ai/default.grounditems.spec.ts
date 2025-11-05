import { beforeEach, describe, expect, it, vi } from 'vitest';
import type {
  IGroundItem,
  IMapState,
  INPC,
  IServerGame,
  ISimpleItem,
  ISpawner,
  IWorldMap,
} from '@lotr/interfaces';
import { ItemClass, ItemSlot } from '@lotr/interfaces';
import { DefaultAIBehavior } from './default';

// Mock dependencies
vi.mock('@lotr/content', () => ({
  itemPropertyGet: vi.fn((item, property) => {
    // Mock implementation for itemPropertyGet
    if (property === 'itemClass') {
      return item.mods?.itemClass || item.itemClass;
    }
    if (property === 'offhand') {
      return item.mods?.offhand || item.offhand;
    }
    if (property === 'twoHanded') {
      return item.mods?.twoHanded || item.twoHanded;
    }
    return undefined;
  }),
}));

vi.mock('@lotr/characters', () => ({
  canAct: vi.fn(() => true),
  getStat: vi.fn(() => 3),
  heal: vi.fn(),
  healToFull: vi.fn(),
  isDead: vi.fn(() => false),
  manaDamage: vi.fn(),
  manaToFull: vi.fn(),
}));

vi.mock('@lotr/logger', () => ({
  consoleWarn: vi.fn(),
  logCrashContextEntry: vi.fn(),
}));

vi.mock('@lotr/rng', () => ({
  oneInX: vi.fn(() => false),
  rollInOneHundred: vi.fn(() => false),
}));

vi.mock('@lotr/shared', () => ({
  directionFromText: vi.fn(),
  directionToOffset: vi.fn(),
  distanceFrom: vi.fn(() => 0),
}));

vi.mock('../worldstate', () => ({
  worldMapStateGetForCharacter: vi.fn(() => null),
}));

vi.mock('../ws', () => ({
  wsSendToSocket: vi.fn(),
}));

describe('DefaultAIBehavior - checkGroundForItems', () => {
  let mockGame: IServerGame;
  let mockMap: IWorldMap;
  let mockMapState: IMapState;
  let mockSpawner: ISpawner;
  let mockNPC: INPC;
  let ai: DefaultAIBehavior;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create mock NPC
    mockNPC = {
      uuid: 'test-npc-uuid',
      name: 'Test NPC',
      map: 'test-map',
      x: 5,
      y: 5,
      items: {
        equipment: {
          [ItemSlot.RightHand]: undefined,
          [ItemSlot.LeftHand]: undefined,
        },
        sack: { items: [] },
      },
      agro: {},
      hp: { current: 100, maximum: 100 },
      mp: { current: 50, maximum: 50 },
      combatTicks: 0,
      usableSkills: [],
    } as unknown as INPC;

    // Create mock spawner
    mockSpawner = {
      walkingAttributes: {
        randomWalkRadius: 5,
        leashRadius: 10,
      },
      hasPaths: false,
      pos: { x: 5, y: 5 },
    } as unknown as ISpawner;

    // Create mock map state
    mockMapState = {
      isThereAnyKnowledgeForXY: vi.fn(() => false),
      getPossibleTargetsFor: vi.fn(() => []),
    } as unknown as IMapState;

    // Create mock map
    mockMap = {} as IWorldMap;

    // Create mock game with necessary methods
    mockGame = {
      groundManager: {
        getItemsFromGround: vi.fn(() => []),
        removeItemFromGround: vi.fn(),
      },
      characterHelper: {
        setLeftHand: vi.fn(),
        setRightHand: vi.fn(),
        addAgro: vi.fn(),
        tryDance: vi.fn(),
      },
      npcHelper: {
        tick: vi.fn(),
      },
      messageHelper: {
        sendLogMessageToRadius: vi.fn(),
      },
      movementHelper: {
        moveRandomly: vi.fn(),
      },
      visibilityHelper: {
        calculateFOV: vi.fn(),
      },
    } as unknown as IServerGame;

    // Create AI instance
    ai = new DefaultAIBehavior(
      mockGame,
      mockMap,
      mockMapState,
      mockSpawner,
      mockNPC,
    );
  });

  describe('NPC with no right hand item', () => {
    it('should not pick up items when NPC has no right hand item', () => {
      mockNPC.items.equipment[ItemSlot.RightHand] = undefined;
      mockNPC.items.equipment[ItemSlot.LeftHand] = undefined;

      ai.tick();

      expect(mockGame.groundManager.getItemsFromGround).not.toHaveBeenCalled();
      expect(mockGame.characterHelper.setLeftHand).not.toHaveBeenCalled();
    });
  });

  describe('NPC with right hand item but already has left hand', () => {
    it('should not pick up items when NPC already has both hands full', () => {
      mockNPC.items.equipment[ItemSlot.RightHand] = {
        uuid: 'sword',
        name: 'Sword',
      } as ISimpleItem;
      mockNPC.items.equipment[ItemSlot.LeftHand] = {
        uuid: 'shield',
        name: 'Shield',
      } as ISimpleItem;

      ai.tick();

      expect(mockGame.groundManager.getItemsFromGround).not.toHaveBeenCalled();
      expect(mockGame.characterHelper.setLeftHand).not.toHaveBeenCalled();
    });
  });

  describe('NPC with two-handed weapon', () => {
    it('should not pick up items when NPC has two-handed weapon', () => {
      const twoHandedWeapon = {
        uuid: 'greatsword',
        name: 'Greatsword',
        twoHanded: true,
      } as ISimpleItem;

      mockNPC.items.equipment[ItemSlot.RightHand] = twoHandedWeapon;
      mockNPC.items.equipment[ItemSlot.LeftHand] = undefined;

      // Mock oneInX to return true for checkGroundForItems to be called
      const { oneInX } = await import('@lotr/rng');
      vi.mocked(oneInX).mockReturnValue(true);

      ai.tick();

      // Should check ground, but not pick up items due to two-handed weapon
      expect(mockGame.characterHelper.setLeftHand).not.toHaveBeenCalled();
    });
  });

  describe('NPC with single-handed weapon and no offhand', () => {
    it('should pick up a shield from the ground', async () => {
      const { oneInX } = await import('@lotr/rng');
      vi.mocked(oneInX).mockReturnValue(true); // Make checkGroundForItems trigger

      const sword = {
        uuid: 'sword',
        name: 'Sword',
        itemClass: ItemClass.Sword,
      } as ISimpleItem;

      const shield = {
        uuid: 'shield',
        name: 'Shield',
        itemClass: ItemClass.Shield,
      } as ISimpleItem;

      mockNPC.items.equipment[ItemSlot.RightHand] = sword;
      mockNPC.items.equipment[ItemSlot.LeftHand] = undefined;

      const groundItem: IGroundItem = {
        item: shield,
        count: 1,
        expiresAt: Date.now() + 10000,
      };

      vi.mocked(mockGame.groundManager.getItemsFromGround).mockReturnValue([
        groundItem,
      ]);

      ai.tick();

      expect(mockGame.groundManager.getItemsFromGround).toHaveBeenCalledWith(
        'test-map',
        5,
        5,
        undefined,
      );
      expect(mockGame.groundManager.removeItemFromGround).toHaveBeenCalledWith(
        'test-map',
        5,
        5,
        ItemClass.Shield,
        'shield',
      );
      expect(mockGame.characterHelper.setLeftHand).toHaveBeenCalledWith(
        mockNPC,
        shield,
      );
    });

    it('should pick up a saucer (shield class) from the ground', async () => {
      const { oneInX } = await import('@lotr/rng');
      vi.mocked(oneInX).mockReturnValue(true);

      const sword = {
        uuid: 'sword',
        name: 'Sword',
        itemClass: ItemClass.Sword,
      } as ISimpleItem;

      const saucer = {
        uuid: 'saucer',
        name: 'Saucer',
        itemClass: ItemClass.Saucer,
      } as ISimpleItem;

      mockNPC.items.equipment[ItemSlot.RightHand] = sword;
      mockNPC.items.equipment[ItemSlot.LeftHand] = undefined;

      const groundItem: IGroundItem = {
        item: saucer,
        count: 1,
        expiresAt: Date.now() + 10000,
      };

      vi.mocked(mockGame.groundManager.getItemsFromGround).mockReturnValue([
        groundItem,
      ]);

      ai.tick();

      expect(mockGame.characterHelper.setLeftHand).toHaveBeenCalledWith(
        mockNPC,
        saucer,
      );
    });

    it('should pick up an offhand weapon from the ground', async () => {
      const { oneInX } = await import('@lotr/rng');
      vi.mocked(oneInX).mockReturnValue(true);

      const sword = {
        uuid: 'sword',
        name: 'Sword',
        itemClass: ItemClass.Sword,
      } as ISimpleItem;

      const dagger = {
        uuid: 'dagger',
        name: 'Dagger',
        itemClass: ItemClass.Dagger,
        offhand: true,
      } as ISimpleItem;

      mockNPC.items.equipment[ItemSlot.RightHand] = sword;
      mockNPC.items.equipment[ItemSlot.LeftHand] = undefined;

      const groundItem: IGroundItem = {
        item: dagger,
        count: 1,
        expiresAt: Date.now() + 10000,
      };

      vi.mocked(mockGame.groundManager.getItemsFromGround).mockReturnValue([
        groundItem,
      ]);

      ai.tick();

      expect(mockGame.characterHelper.setLeftHand).toHaveBeenCalledWith(
        mockNPC,
        dagger,
      );
    });

    it('should not pick up non-offhand, non-shield items', async () => {
      const { oneInX } = await import('@lotr/rng');
      vi.mocked(oneInX).mockReturnValue(true);

      const sword = {
        uuid: 'sword',
        name: 'Sword',
        itemClass: ItemClass.Sword,
      } as ISimpleItem;

      const potion = {
        uuid: 'potion',
        name: 'Health Potion',
        itemClass: ItemClass.Bottle,
        offhand: false,
      } as ISimpleItem;

      mockNPC.items.equipment[ItemSlot.RightHand] = sword;
      mockNPC.items.equipment[ItemSlot.LeftHand] = undefined;

      const groundItem: IGroundItem = {
        item: potion,
        count: 1,
        expiresAt: Date.now() + 10000,
      };

      vi.mocked(mockGame.groundManager.getItemsFromGround).mockReturnValue([
        groundItem,
      ]);

      ai.tick();

      expect(mockGame.characterHelper.setLeftHand).not.toHaveBeenCalled();
      expect(
        mockGame.groundManager.removeItemFromGround,
      ).not.toHaveBeenCalled();
    });

    it('should pick up the first suitable item when multiple items are on ground', async () => {
      const { oneInX } = await import('@lotr/rng');
      vi.mocked(oneInX).mockReturnValue(true);

      const sword = {
        uuid: 'sword',
        name: 'Sword',
        itemClass: ItemClass.Sword,
      } as ISimpleItem;

      const potion = {
        uuid: 'potion',
        name: 'Health Potion',
        itemClass: ItemClass.Bottle,
      } as ISimpleItem;

      const shield = {
        uuid: 'shield',
        name: 'Shield',
        itemClass: ItemClass.Shield,
      } as ISimpleItem;

      const dagger = {
        uuid: 'dagger',
        name: 'Dagger',
        itemClass: ItemClass.Dagger,
        offhand: true,
      } as ISimpleItem;

      mockNPC.items.equipment[ItemSlot.RightHand] = sword;
      mockNPC.items.equipment[ItemSlot.LeftHand] = undefined;

      vi.mocked(mockGame.groundManager.getItemsFromGround).mockReturnValue([
        { item: potion, count: 1, expiresAt: Date.now() + 10000 },
        { item: shield, count: 1, expiresAt: Date.now() + 10000 },
        { item: dagger, count: 1, expiresAt: Date.now() + 10000 },
      ]);

      ai.tick();

      // Should pick up the shield (first suitable item)
      expect(mockGame.characterHelper.setLeftHand).toHaveBeenCalledWith(
        mockNPC,
        shield,
      );
      expect(mockGame.groundManager.removeItemFromGround).toHaveBeenCalledWith(
        'test-map',
        5,
        5,
        ItemClass.Shield,
        'shield',
      );
    });
  });

  describe('No items on ground', () => {
    it('should not attempt to pick up when ground is empty', async () => {
      const { oneInX } = await import('@lotr/rng');
      vi.mocked(oneInX).mockReturnValue(true);

      const sword = {
        uuid: 'sword',
        name: 'Sword',
        itemClass: ItemClass.Sword,
      } as ISimpleItem;

      mockNPC.items.equipment[ItemSlot.RightHand] = sword;
      mockNPC.items.equipment[ItemSlot.LeftHand] = undefined;

      vi.mocked(mockGame.groundManager.getItemsFromGround).mockReturnValue([]);

      ai.tick();

      expect(mockGame.characterHelper.setLeftHand).not.toHaveBeenCalled();
      expect(
        mockGame.groundManager.removeItemFromGround,
      ).not.toHaveBeenCalled();
    });
  });
});
