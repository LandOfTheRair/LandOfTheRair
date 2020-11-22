import { Currency, GameAction, IPlayer, IVendorItem } from '../../interfaces';

// dispatched when the play game button is hit
export class PlayGame {
  static type = GameAction.GamePlay;
  constructor() {}
}

// dispatched when the first SetPlayer is received
export class PlayerReady {
  static type = GameAction.GamePlayerReady;
  constructor() {}
}

// dispatched when the player quits game by any means
export class QuitGame {
  static type = GameAction.GameQuit;
  constructor() {}
}

// dispatched when a map is received from the server
export class SetMap {
  static type = GameAction.GameSetMap;
  constructor(public map: any) {}
}

// dispatched when the server wants to do a full SetPlayer instead of patch
export class SetPlayer {
  static type = GameAction.GameSetPlayer;
  constructor(public player: IPlayer) {}
}

// dispatched when the server wants to patch the player
export class PatchPlayer {
  static type = GameAction.GamePatchPlayer;
  constructor(public player: Partial<IPlayer>, public patches: any[]) {}
}

// dispatched when the server wants to patch the player state (npcs, ground, etc)
export class PatchGameStateForPlayer {
  static type = GameAction.GamePatchPlayerState;
  constructor(public statePatches: any[]) {}
}

// dispatched when clicking on a targets box
export class SetCurrentTarget {
  static type = GameAction.SetCurrentTarget;
  constructor(public target: string) {}
}

// dispatched when hovering over an item
export class SetCurrentItemTooltip {
  static type = GameAction.SetCurrentItemTooltip;
  filterOutFromLogs = true;
  constructor(public tooltip: string) {}
}

// dispatched when greeting a trainer
export class OpenTrainerWindow {
  static type = GameAction.NPCActionShowTrainer;
  constructor(
    public npcUUID: string,
    public npcName: string,
    public npcSprite: number,
    public npcMaxLevel: number,
    public npcMaxSkill: number
  ) {}
}

// dispatched when greeting a vendor
export class OpenVendorWindow {
  static type = GameAction.NPCActionShowVendor;
  constructor(
    public npcUUID: string,
    public npcName: string,
    public npcSprite: number,
    public npcVendorCurrency: Currency,
    public npcVendorItems: IVendorItem[],
    public npcVendorDailyItems: IVendorItem[]
  ) {}
}
