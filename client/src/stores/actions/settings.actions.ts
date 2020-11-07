import { ChatMode, GameAction, GameOption } from '../../interfaces';


// dispatched when an account is added to the quick login selector
export class AddAccount {
  static type = '[Settings] Add account';
  constructor(public username: string, public password: string, public autologin?: boolean) {}
}

// dispatched when an account is removed from the quick login selector
export class RemoveAccount {
  static type = '[Settings] Remove account';
  constructor(public username: string) {}
}

// dispatched any time a window moves
export class UpdateWindowPosition {
  static type = '[Settings] Update window position';
  constructor(
    public windowName: string,
    public windowProps: { x?: number, y?: number, width?: number, height?: number, hidden?: boolean },
    public overwrite?: boolean
  ) {}
}

// dispatched when a window is created
export class SetDefaultWindowPosition {
  static type = '[Settings] Set default window position';
  constructor(
    public windowName: string,
    public windowProps: { x?: number, y?: number  }
  ) {}
}

// dispatched when "reset window positions" set
export class ResetWindowPositions {
  static type = '[Settings] Reset window positions';
  constructor() {}
}

// dispatched when a window is marked hidden
export class HideWindow {
  static type = '[Settings] Hide Window';
  constructor(public windowName: string) {}
}

// dispatched when a window is shown
export class ShowWindow {
  static type = '[Settings] Show Window';
  constructor(public windowName: string) {}
}

// dispatched when a window is marked active (usually via click)
export class SetActiveWindow {
  static type = '[Settings] Set active window';
  constructor(public windowName: string) {}
}

// dispatched when the user changes their currently active character slot
export class SetCharSlot {
  static type = '[Settings] Set char slot';
  constructor(public charSlot: number) {}
}

// dispatched when the server sends the asset hash to the client
export class SetAssetHash {
  static type = GameAction.SettingsSetAssetHash;
  constructor(public assetHash: string) {}
}

// dispatched when the user changes their in game chat mode
export class SetChatMode {
  static type = GameAction.SettingsSetChatMode;
  constructor(public chatMode: ChatMode) {}
}

// dispatched when the user changes their in game log mode
export class SetLogMode {
  static type = GameAction.SettingsSetLogMode;
  constructor(public logMode: 'All'|'General'|'Combat'|'NPC') {}
}

// dispatched when a command happens, and is logged in history
export class LogCurrentCommandInHistory {
  static type = GameAction.LogCurrentCommand;
  constructor() {}
}

// dispatched when something calls to set the current command, typing or otherwise
export class SetCurrentCommand {
  static type = GameAction.SetCurrentCommand;
  constructor(public command: string) {}
}

// dispatched to set any client game option
export class SetOption {
  static type = GameAction.SetOption;
  constructor(public option: GameOption, public value: boolean|number) {}
}

// dispatched when the user changes their character view
export class SetCharacterView {
  static type = GameAction.SettingsSetCharacterView;
  constructor(public charMode: 'Equipment'|'Stats'|'Skills') {}
}
