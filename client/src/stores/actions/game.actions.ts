import { Currency, GameAction, ICharacter, IItemContainer, IPlayer, IVendorItem } from '../../interfaces';

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
  filterOutFromLogs = true;
  constructor(public player: IPlayer) {}
}

// dispatched when the server wants to patch the player
export class PatchPlayer {
  static type = GameAction.GamePatchPlayer;
  filterOutFromLogs = true;
  constructor(public player: Partial<IPlayer>, public patches: any[]) {}
}

// dispatched when the server wants to patch the player state (npcs, ground, etc)
export class PatchGameStateForPlayer {
  static type = GameAction.GamePatchPlayerState;
  filterOutFromLogs = true;
  constructor(public statePatches: any[]) {}
}

// dispatched when the player moves
export class PatchPlayerPosition {
  static type = GameAction.GameSetPosition;
  filterOutFromLogs = true;
  constructor(public x: number, public y: number) {}
}

// dispatched when clicking on a targets box
export class SetCurrentTarget {
  static type = GameAction.SetCurrentTarget;
  constructor(public target: string) {}
}

// dispatched when clicking on a targets box
export class ViewCharacterEquipment {
  static type = GameAction.ViewCharacterEquipment;
  constructor(public character: ICharacter) {}
}

// dispatched when hovering over an item
export class SetCurrentItemTooltip {
  static type = GameAction.SetCurrentItemTooltip;
  filterOutFromLogs = true;
  constructor(public tooltip: string, public upgrades: string[]) {}
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

// dispatched when walking away from a trainer
export class HideTrainerWindow {
  static type = GameAction.NPCActionHideTrainer;
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

// dispatched when walking away from a banker
export class HideVendorWindow {
  static type = GameAction.NPCActionHideVendor;
}

// dispatched when greeting a vendor
export class OpenBankWindow {
  static type = GameAction.NPCActionShowBank;
  constructor(
    public npcUUID: string,
    public npcName: string,
    public npcSprite: number,
    public npcBank: string,
    public npcBranch: string
  ) {}
}

// dispatched when walking away from a banker
export class HideBankWindow {
  static type = GameAction.NPCActionHideBank;
}


// dispatched when opening a locker
export class OpenLockerWindow {
  static type = GameAction.LockerActionShow;
  constructor(
    public lockerName: string,
    public showLockers: string[],
    public playerLockers: Record<string, IItemContainer>
  ) {}
}

// dispatched when walking away from a banker
export class HideLockerWindow {
  static type = GameAction.LockerActionHide;
}
