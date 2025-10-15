import type {
  FOVVisibility,
  GameServerResponse,
  IPlayer,
  IPlayerState,
} from '@lotr/interfaces';
import { GameAction } from '@lotr/interfaces';
import {
  generate,
  observe,
  unobserve,
  type Observer,
  type Operation,
} from 'fast-json-patch';
import {
  patchShouldSend,
  playerPatchModify,
  playerPatchShouldSend,
} from './transmission.patch';
import { wsSendToSocket } from './ws';

interface PlayerPatchSet {
  patches?: Operation[];
  player?: Partial<IPlayer>;
}

const playerPatchWatchers: Record<string, Observer<IPlayer>> = {};
const playerStateWatchers: Record<string, Observer<IPlayerState>> = {};
const playerPatchQueue: Record<
  string,
  { patches: Operation[]; player: Partial<IPlayer> }
> = {};

// queue data to be sent to a player during their next patch
function transmissionPlayerPatchQueue(player: IPlayer, patch: PlayerPatchSet) {
  const patchQueue = playerPatchQueue[player.username];
  if (!patchQueue) return;

  if (patch.patches) {
    patchQueue.patches.push(...patch.patches.filter((p) => patchShouldSend(p)));
  }

  if (patch.player) {
    patchQueue.player = Object.assign({}, patchQueue.player, patch.player);
  }
}

// send an action to an account. very useful.
export function transmissionActionSendAccount(
  username: string,
  action: GameAction,
  data: any,
): void {
  if (!username) return;

  wsSendToSocket(username, { action, ...data });
}

// send a response to an account. very useful.
export function transmissionSendResponseToAccount(
  username: string,
  type: GameServerResponse,
  data: any,
): void {
  if (!username) return;

  wsSendToSocket(username, { type, ...data });
}

// send an action to a player. also very useful
export function transmissionDataSendPlayer(
  player: IPlayer,
  action: GameAction,
  data = {},
): void {
  transmissionActionSendAccount(player.username, action, data);
}

// send a response to an account. very useful.
export function transmissionResponseSendPlayer(
  player: IPlayer,
  type: GameServerResponse,
  data: any,
): void {
  transmissionSendResponseToAccount(player.username, type, data);
}

// send a patch to a player regarding their player state
function transmissionPlayerStatePatch(player: IPlayer) {
  const patchWatcher = playerStateWatchers[player.username];
  if (!patchWatcher) return;

  const patches = generate(patchWatcher)
    .filter((p) => playerPatchShouldSend(p))
    .map((p) => playerPatchModify(p));
  if (patches.length === 0) return;

  transmissionActionSendAccount(
    player.username,
    GameAction.GamePatchPlayerState,
    {
      statePatches: patches,
    },
  );
}

// set up a watcher for player changes
export function transmissionStartWatching(
  player: IPlayer,
  state: IPlayerState,
) {
  playerPatchWatchers[player.username] = observe(player);
  playerStateWatchers[player.username] = observe(state);
  playerPatchQueue[player.username] = { patches: [], player: {} };
}

// stop watching a players changes
export function transmissionStopWatching(player: IPlayer) {
  const patchWatcher = playerPatchWatchers[player.username];
  if (!patchWatcher) return;

  unobserve(player, patchWatcher);
  delete playerPatchWatchers[player.username];
  delete playerPatchQueue[player.username];
}

// generate and queue player object patches
export function transmissionPlayerPatchGenerateQueue(player: IPlayer) {
  if (!playerPatchWatchers[player.username]) return;

  // we twiddle the fov here because it creates a bunch of unnecessary patches
  // hell yeah micro optimizations
  // const fov = player.fov;
  // delete (player as any).fov;

  const patches = generate(playerPatchWatchers[player.username]!);

  // reset the fov because we do still need it
  // player.fov = fov;
  transmissionPlayerPatchQueue(player, { patches });
}

// send a specific patch for player FOV
export function transmissionFOVPatchSend(player: IPlayer) {
  transmissionActionSendAccount(player.username, GameAction.GamePatchPlayer, {
    player: { fov: player.fov },
  });
}

// send a specific patch for player movement
export function transmissionMovementPatchSend(
  player: IPlayer,
  blankFOV = false,
) {
  const fov = blankFOV ? {} : player.fov;
  if (blankFOV) {
    for (let x = -4; x <= 4; x++) {
      fov[x] = fov[x] || {};
      for (let y = -4; y <= 4; y++) {
        fov[x]![y] = false as unknown as FOVVisibility;
      }
    }
  }

  transmissionActionSendAccount(player.username, GameAction.GamePatchPlayer, {
    player: { fov: player.fov, x: player.x, y: player.y, dir: player.dir },
  });
}

// specific helper to send patches to a player
function transmissionPlayerPatchSend(
  player: IPlayer,
  patchData: PlayerPatchSet = {},
): void {
  transmissionActionSendAccount(
    player.username,
    GameAction.GamePatchPlayer,
    patchData,
  );
}

// send patches to a player about themselves
function transmissionPlayerPatchSendAndReset(player: IPlayer) {
  const patchData = playerPatchQueue[player.username];
  if (!patchData) return;

  if (
    patchData.patches.length === 0 &&
    Object.keys(patchData.player).length === 0
  ) {
    return;
  }

  transmissionPlayerPatchSend(player, patchData);
  patchData.player = {};
  patchData.patches = [];
}

// auto patch a player. just calls patch player for now
export function transmissionPlayerPatchTryAuto(player: IPlayer) {
  transmissionPlayerPatchSendAndReset(player);
  transmissionPlayerStatePatch(player);
}
