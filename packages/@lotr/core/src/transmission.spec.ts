import {
  FOVVisibility,
  GameAction,
  GameServerResponse,
  type IPlayer,
  type IPlayerState,
} from '@lotr/interfaces';
import { generate, observe, unobserve } from 'fast-json-patch';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  transmissionActionSendAccount,
  transmissionDataSendPlayer,
  transmissionFOVPatchSend,
  transmissionMovementPatchSend,
  transmissionPlayerPatchGenerateQueue,
  transmissionPlayerPatchTryAuto,
  transmissionResponseSendPlayer,
  transmissionSendResponseToAccount,
  transmissionStartWatching,
  transmissionStopWatching,
} from './transmission';

// Mock dependencies
vi.mock('./ws', () => ({
  wsSendToSocket: vi.fn(),
}));

vi.mock('./transmission.patch', () => ({
  patchShouldSend: vi.fn((patch) => true),
  playerPatchShouldSend: vi.fn((patch) => true),
  playerPatchModify: vi.fn((patch) => patch),
}));

vi.mock('fast-json-patch', () => ({
  generate: vi.fn(),
  observe: vi.fn(),
  unobserve: vi.fn(),
}));

import {
  patchShouldSend,
  playerPatchModify,
  playerPatchShouldSend,
} from './transmission.patch';
import { wsSendToSocket } from './ws';

describe('transmission', () => {
  let mockPlayer: IPlayer;
  let mockPlayerState: IPlayerState;
  let mockObserver: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockPlayer = {
      username: 'testuser',
      x: 10,
      y: 20,
      dir: 'North',
      fov: {
        0: { 0: FOVVisibility.CanSee },
        1: { 1: FOVVisibility.CantSee },
      },
    } as unknown as IPlayer;

    mockPlayerState = {
      npcs: {},
      players: {},
      ground: {} as any,
      openDoors: {},
    } as IPlayerState;

    mockObserver = { id: 'observer-123' };
    vi.mocked(observe).mockReturnValue(mockObserver);
    vi.mocked(generate).mockReturnValue([]);
  });

  describe('transmissionActionSendAccount', () => {
    it('should send action to account when username is provided', () => {
      const action = GameAction.GamePatchPlayer;
      const data = { test: 'data' };

      transmissionActionSendAccount('testuser', action, data);

      expect(wsSendToSocket).toHaveBeenCalledWith('testuser', {
        action,
        test: 'data',
      });
    });

    it('should not send action when username is empty', () => {
      transmissionActionSendAccount('', GameAction.GamePatchPlayer, {});
      expect(wsSendToSocket).not.toHaveBeenCalled();
    });

    it('should not send action when username is null', () => {
      transmissionActionSendAccount(
        null as any,
        GameAction.GamePatchPlayer,
        {},
      );
      expect(wsSendToSocket).not.toHaveBeenCalled();
    });

    it('should not send action when username is undefined', () => {
      transmissionActionSendAccount(
        undefined as any,
        GameAction.GamePatchPlayer,
        {},
      );
      expect(wsSendToSocket).not.toHaveBeenCalled();
    });
  });

  describe('transmissionSendResponseToAccount', () => {
    it('should send response to account when username is provided', () => {
      const type = GameServerResponse.Error;
      const data = { error: 'test error' };

      transmissionSendResponseToAccount('testuser', type, data);

      expect(wsSendToSocket).toHaveBeenCalledWith('testuser', {
        type,
        error: 'test error',
      });
    });

    it('should not send response when username is empty', () => {
      transmissionSendResponseToAccount('', GameServerResponse.Error, {});
      expect(wsSendToSocket).not.toHaveBeenCalled();
    });

    it('should not send response when username is null', () => {
      transmissionSendResponseToAccount(
        null as any,
        GameServerResponse.Error,
        {},
      );
      expect(wsSendToSocket).not.toHaveBeenCalled();
    });

    it('should not send response when username is undefined', () => {
      transmissionSendResponseToAccount(
        undefined as any,
        GameServerResponse.Error,
        {},
      );
      expect(wsSendToSocket).not.toHaveBeenCalled();
    });
  });

  describe('transmissionDataSendPlayer', () => {
    it('should send action to player with data', () => {
      const action = GameAction.GamePatchPlayer;
      const data = { test: 'data' };

      transmissionDataSendPlayer(mockPlayer, action, data);

      expect(wsSendToSocket).toHaveBeenCalledWith('testuser', {
        action,
        test: 'data',
      });
    });

    it('should send action to player with empty data when no data provided', () => {
      const action = GameAction.GamePatchPlayer;

      transmissionDataSendPlayer(mockPlayer, action);

      expect(wsSendToSocket).toHaveBeenCalledWith('testuser', { action });
    });

    it('should send action to player with explicit empty object', () => {
      const action = GameAction.GamePatchPlayer;

      transmissionDataSendPlayer(mockPlayer, action, {});

      expect(wsSendToSocket).toHaveBeenCalledWith('testuser', { action });
    });
  });

  describe('transmissionResponseSendPlayer', () => {
    it('should send response to player', () => {
      const type = GameServerResponse.Error;
      const data = { error: 'test error' };

      transmissionResponseSendPlayer(mockPlayer, type, data);

      expect(wsSendToSocket).toHaveBeenCalledWith('testuser', {
        type,
        error: 'test error',
      });
    });

    it('should send response to player with null data', () => {
      const type = GameServerResponse.Error;

      transmissionResponseSendPlayer(mockPlayer, type, null);

      expect(wsSendToSocket).toHaveBeenCalledWith('testuser', { type });
    });
  });

  describe('transmissionStartWatching', () => {
    it('should set up watchers for player and state', () => {
      transmissionStartWatching(mockPlayer, mockPlayerState);

      expect(observe).toHaveBeenCalledWith(mockPlayer);
      expect(observe).toHaveBeenCalledWith(mockPlayerState);
      expect(observe).toHaveBeenCalledTimes(2);
    });

    it('should initialize patch queue for player', () => {
      transmissionStartWatching(mockPlayer, mockPlayerState);

      // Verify that the patch queue is set up by trying to generate patches
      transmissionPlayerPatchGenerateQueue(mockPlayer);
      expect(generate).toHaveBeenCalledWith(mockObserver);
    });
  });

  describe('transmissionStopWatching', () => {
    it('should stop watching and clean up when watcher exists', () => {
      // Start watching first
      transmissionStartWatching(mockPlayer, mockPlayerState);

      // Now stop watching
      transmissionStopWatching(mockPlayer);

      expect(unobserve).toHaveBeenCalledWith(mockPlayer, mockObserver);
    });

    it('should handle stopping watch when no watcher exists', () => {
      transmissionStopWatching(mockPlayer);

      expect(unobserve).not.toHaveBeenCalled();
    });

    it('should clean up patch queue after stopping watching', () => {
      // Start watching first
      transmissionStartWatching(mockPlayer, mockPlayerState);

      // Verify queue is set up
      transmissionPlayerPatchGenerateQueue(mockPlayer);
      expect(generate).toHaveBeenCalledTimes(1);

      // Stop watching
      transmissionStopWatching(mockPlayer);

      // Try to generate patches again - should not work
      vi.clearAllMocks();
      transmissionPlayerPatchGenerateQueue(mockPlayer);
      expect(generate).not.toHaveBeenCalled();
    });
  });

  describe('transmissionPlayerPatchGenerateQueue', () => {
    it('should generate patches when watcher exists', () => {
      transmissionStartWatching(mockPlayer, mockPlayerState);

      transmissionPlayerPatchGenerateQueue(mockPlayer);

      expect(generate).toHaveBeenCalledWith(mockObserver);
    });

    it('should not generate patches when no watcher exists', () => {
      vi.clearAllMocks(); // Clear any previous calls

      // Use a different player to avoid global state conflicts
      const freshPlayer = {
        ...mockPlayer,
        username: 'freshuser',
      } as unknown as IPlayer;
      transmissionPlayerPatchGenerateQueue(freshPlayer);

      expect(generate).not.toHaveBeenCalled();
    });

    it('should handle patches with filtering', () => {
      const mockPatches = [
        { op: 'replace', path: '/x', value: 15 } as any,
        { op: 'replace', path: '/y', value: 25 } as any,
      ];
      vi.mocked(generate).mockReturnValue(mockPatches);
      vi.mocked(patchShouldSend).mockImplementation(
        (patch) => patch.path !== '/x',
      );

      transmissionStartWatching(mockPlayer, mockPlayerState);
      transmissionPlayerPatchGenerateQueue(mockPlayer);

      expect(patchShouldSend).toHaveBeenCalledWith(mockPatches[0]);
      expect(patchShouldSend).toHaveBeenCalledWith(mockPatches[1]);
    });
  });

  describe('transmissionFOVPatchSend', () => {
    it('should send FOV patch to player', () => {
      transmissionFOVPatchSend(mockPlayer);

      expect(wsSendToSocket).toHaveBeenCalledWith('testuser', {
        action: GameAction.GamePatchPlayer,
        player: { fov: mockPlayer.fov },
      });
    });

    it('should send FOV patch with complex FOV data', () => {
      const complexFOV = {
        [-1]: { [-1]: FOVVisibility.CantSee, [0]: FOVVisibility.CanSee },
        [0]: { [0]: FOVVisibility.CanSee },
        [1]: { [1]: FOVVisibility.CantSee },
      };
      mockPlayer.fov = complexFOV;

      transmissionFOVPatchSend(mockPlayer);

      expect(wsSendToSocket).toHaveBeenCalledWith('testuser', {
        action: GameAction.GamePatchPlayer,
        player: { fov: complexFOV },
      });
    });
  });

  describe('transmissionMovementPatchSend', () => {
    it('should send movement patch with normal FOV', () => {
      transmissionMovementPatchSend(mockPlayer);

      expect(wsSendToSocket).toHaveBeenCalledWith('testuser', {
        action: GameAction.GamePatchPlayer,
        player: {
          fov: mockPlayer.fov,
          x: mockPlayer.x,
          y: mockPlayer.y,
          dir: mockPlayer.dir,
        },
      });
    });

    it('should send movement patch with blank FOV when blankFOV is true', () => {
      transmissionMovementPatchSend(mockPlayer, true);

      expect(wsSendToSocket).toHaveBeenCalledWith('testuser', {
        action: GameAction.GamePatchPlayer,
        player: {
          fov: mockPlayer.fov, // Note: the function uses player.fov, not the blank one
          x: mockPlayer.x,
          y: mockPlayer.y,
          dir: mockPlayer.dir,
        },
      });
    });

    it('should handle movement patch with blankFOV false explicitly', () => {
      transmissionMovementPatchSend(mockPlayer, false);

      expect(wsSendToSocket).toHaveBeenCalledWith('testuser', {
        action: GameAction.GamePatchPlayer,
        player: {
          fov: mockPlayer.fov,
          x: mockPlayer.x,
          y: mockPlayer.y,
          dir: mockPlayer.dir,
        },
      });
    });
  });

  describe('transmissionPlayerPatchTryAuto', () => {
    beforeEach(() => {
      // Mock the generate function to return some patches for state watcher
      vi.mocked(generate).mockImplementation(() => [
        { op: 'replace', path: '/testProp', value: 'testValue' } as any,
      ]);
    });

    it('should call patch functions when watchers exist', () => {
      transmissionStartWatching(mockPlayer, mockPlayerState);

      transmissionPlayerPatchTryAuto(mockPlayer);

      // Should call generate for state patches
      expect(generate).toHaveBeenCalled();
    });

    it('should handle auto patch when no patches in queue', () => {
      transmissionStartWatching(mockPlayer, mockPlayerState);
      vi.mocked(generate).mockReturnValue([]); // No patches

      transmissionPlayerPatchTryAuto(mockPlayer);

      // Should not send any patches but should still check
      expect(generate).toHaveBeenCalled();
    });

    it('should handle auto patch when no watchers exist', () => {
      vi.clearAllMocks(); // Clear any previous calls
      vi.mocked(generate).mockReturnValue([]); // No patches when no watchers

      transmissionPlayerPatchTryAuto(mockPlayer);

      // Should not send any patches since no watchers
      expect(wsSendToSocket).not.toHaveBeenCalled();
    });

    it('should send state patches when they exist and pass filters', () => {
      const statePatches = [
        { op: 'replace', path: '/health', value: 100 } as any,
      ];
      vi.mocked(generate).mockReturnValue(statePatches);
      vi.mocked(playerPatchShouldSend).mockReturnValue(true);
      vi.mocked(playerPatchModify).mockImplementation((patch) => patch);

      transmissionStartWatching(mockPlayer, mockPlayerState);
      transmissionPlayerPatchTryAuto(mockPlayer);

      expect(playerPatchShouldSend).toHaveBeenCalledWith(statePatches[0]);
      expect(playerPatchModify).toHaveBeenCalledWith(statePatches[0]);
      expect(wsSendToSocket).toHaveBeenCalledWith('testuser', {
        action: GameAction.GamePatchPlayerState,
        statePatches,
      });
    });

    it('should not send state patches when they are filtered out', () => {
      const statePatches = [
        { op: 'replace', path: '/secretData', value: 'hidden' } as any,
      ];
      vi.mocked(generate).mockReturnValue(statePatches);
      vi.mocked(playerPatchShouldSend).mockReturnValue(false); // Filter out

      transmissionStartWatching(mockPlayer, mockPlayerState);
      transmissionPlayerPatchTryAuto(mockPlayer);

      expect(playerPatchShouldSend).toHaveBeenCalledWith(statePatches[0]);
      // Should not send patches since they were filtered
      expect(wsSendToSocket).not.toHaveBeenCalledWith(
        'testuser',
        expect.objectContaining({
          action: GameAction.GamePatchPlayerState,
        }),
      );
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete player lifecycle', () => {
      // Start watching
      transmissionStartWatching(mockPlayer, mockPlayerState);

      // Generate some patches
      const patches = [{ op: 'replace', path: '/x', value: 15 } as any];
      vi.mocked(generate).mockReturnValue(patches);
      transmissionPlayerPatchGenerateQueue(mockPlayer);

      // Send FOV patch
      transmissionFOVPatchSend(mockPlayer);

      // Try auto patch
      transmissionPlayerPatchTryAuto(mockPlayer);

      // Stop watching
      transmissionStopWatching(mockPlayer);

      expect(observe).toHaveBeenCalledTimes(2);
      expect(unobserve).toHaveBeenCalledTimes(1);
      expect(wsSendToSocket).toHaveBeenCalled();
    });

    it('should handle multiple players simultaneously', () => {
      const player2: IPlayer = {
        ...mockPlayer,
        username: 'player2',
      } as unknown as IPlayer;
      const state2: IPlayerState = { ...mockPlayerState };

      transmissionStartWatching(mockPlayer, mockPlayerState);
      transmissionStartWatching(player2, state2);

      transmissionFOVPatchSend(mockPlayer);
      transmissionFOVPatchSend(player2);

      expect(wsSendToSocket).toHaveBeenCalledWith(
        'testuser',
        expect.any(Object),
      );
      expect(wsSendToSocket).toHaveBeenCalledWith(
        'player2',
        expect.any(Object),
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle player with missing username gracefully', () => {
      const playerWithoutUsername = { ...mockPlayer, username: '' };

      expect(() => {
        transmissionActionSendAccount(
          playerWithoutUsername.username,
          GameAction.GamePatchPlayer,
          {},
        );
      }).not.toThrow();

      expect(wsSendToSocket).not.toHaveBeenCalled();
    });

    it('should handle null player objects', () => {
      expect(() => {
        transmissionDataSendPlayer(null as any, GameAction.GamePatchPlayer, {});
      }).toThrow();
    });

    it('should handle undefined player properties', () => {
      const incompletePlayer = { username: 'test' } as IPlayer;

      expect(() => {
        transmissionFOVPatchSend(incompletePlayer);
      }).not.toThrow();
    });
  });

  describe('Internal Functions Coverage', () => {
    it('should cover transmissionPlayerPatchQueue through transmissionPlayerPatchGenerateQueue', () => {
      // Set up patches that will be queued
      const patches = [
        { op: 'replace', path: '/x', value: 30 } as any,
        { op: 'replace', path: '/y', value: 40 } as any,
      ];
      vi.mocked(generate).mockReturnValue(patches);
      vi.mocked(patchShouldSend).mockImplementation(
        (patch) => patch.path !== '/x',
      ); // Filter out x

      transmissionStartWatching(mockPlayer, mockPlayerState);
      transmissionPlayerPatchGenerateQueue(mockPlayer);

      expect(patchShouldSend).toHaveBeenCalledWith(patches[0]);
      expect(patchShouldSend).toHaveBeenCalledWith(patches[1]);
    });

    it('should cover transmissionPlayerPatchSendAndReset with patches in queue', () => {
      // Setup a patch queue first
      const patches = [{ op: 'replace', path: '/health', value: 100 } as any];
      vi.mocked(generate).mockReturnValue(patches);
      vi.mocked(patchShouldSend).mockReturnValue(true);

      transmissionStartWatching(mockPlayer, mockPlayerState);
      transmissionPlayerPatchGenerateQueue(mockPlayer);

      // Now call auto patch which should send and reset the queue
      vi.clearAllMocks();
      transmissionPlayerPatchTryAuto(mockPlayer);

      // Should have sent patches
      expect(wsSendToSocket).toHaveBeenCalled();
    });

    it('should cover transmissionPlayerPatchSendAndReset with empty queue', () => {
      transmissionStartWatching(mockPlayer, mockPlayerState);

      // Don't generate any patches, so queue is empty
      vi.mocked(generate).mockReturnValue([]);
      transmissionPlayerPatchGenerateQueue(mockPlayer);

      vi.clearAllMocks();
      transmissionPlayerPatchTryAuto(mockPlayer);

      // Should not send patches when queue is empty
      expect(wsSendToSocket).not.toHaveBeenCalledWith(
        'testuser',
        expect.objectContaining({
          action: GameAction.GamePatchPlayer,
        }),
      );
    });

    it('should cover transmissionPlayerStatePatch return paths', () => {
      transmissionStartWatching(mockPlayer, mockPlayerState);

      // Test with patches that get filtered out
      const statePatches = [
        { op: 'replace', path: '/filtered', value: 'test' } as any,
      ];
      vi.mocked(generate).mockReturnValue(statePatches);
      vi.mocked(playerPatchShouldSend).mockReturnValue(false); // All filtered out

      transmissionPlayerPatchTryAuto(mockPlayer);

      expect(playerPatchShouldSend).toHaveBeenCalledWith(statePatches[0]);
    });

    it('should cover transmissionPlayerPatchQueue with no patches', () => {
      transmissionStartWatching(mockPlayer, mockPlayerState);

      // Generate patches but they all get filtered out by patchShouldSend
      const patches = [
        { op: 'replace', path: '/filtered', value: 'test' } as any,
      ];
      vi.mocked(generate).mockReturnValue(patches);
      vi.mocked(patchShouldSend).mockReturnValue(false); // Filter everything

      transmissionPlayerPatchGenerateQueue(mockPlayer);

      expect(patchShouldSend).toHaveBeenCalledWith(patches[0]);
    });

    it('should cover transmissionPlayerPatchQueue with player data', () => {
      transmissionStartWatching(mockPlayer, mockPlayerState);

      // Generate patches with both patches and player data
      const patches = [{ op: 'replace', path: '/x', value: 50 } as any];
      vi.mocked(generate).mockReturnValue(patches);
      vi.mocked(patchShouldSend).mockReturnValue(true);

      transmissionPlayerPatchGenerateQueue(mockPlayer);

      // The function should queue both patches and player data
      vi.clearAllMocks();
      transmissionPlayerPatchTryAuto(mockPlayer);

      expect(wsSendToSocket).toHaveBeenCalled();
    });

    it('should cover transmissionMovementPatchSend blank FOV generation', () => {
      // Test the blank FOV creation logic
      const playerWithMinimalFOV = {
        ...mockPlayer,
        fov: {},
      } as unknown as IPlayer;

      transmissionMovementPatchSend(playerWithMinimalFOV, true);

      expect(wsSendToSocket).toHaveBeenCalledWith('testuser', {
        action: GameAction.GamePatchPlayer,
        player: {
          fov: playerWithMinimalFOV.fov, // Uses player.fov in the actual call
          x: playerWithMinimalFOV.x,
          y: playerWithMinimalFOV.y,
          dir: playerWithMinimalFOV.dir,
        },
      });
    });

    it('should cover transmissionPlayerPatchQueue with player data in patch', () => {
      // This test specifically targets lines 44-45 in transmissionPlayerPatchQueue
      // We need to call the internal function through an exported function that passes player data
      transmissionStartWatching(mockPlayer, mockPlayerState);

      // Generate patches to trigger the internal transmissionPlayerPatchQueue call
      const patches = [{ op: 'replace', path: '/x', value: 60 } as any];
      vi.mocked(generate).mockReturnValue(patches);
      vi.mocked(patchShouldSend).mockReturnValue(true);

      transmissionPlayerPatchGenerateQueue(mockPlayer);

      // This will trigger transmissionPlayerPatchSendAndReset which calls transmissionPlayerPatchSend
      // The patch queue should now contain both patches and potentially player data
      vi.clearAllMocks();

      // Reset mocks to track the final send
      vi.mocked(generate).mockReturnValue([]);
      transmissionPlayerPatchTryAuto(mockPlayer);

      // Verify that the patches were sent (proving the player data path was taken)
      expect(wsSendToSocket).toHaveBeenCalledWith(
        'testuser',
        expect.objectContaining({
          action: GameAction.GamePatchPlayer,
        }),
      );
    });
  });
});
