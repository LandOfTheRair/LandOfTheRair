export interface IAccountSettings {
  username: string;
  password: string;
  autologin?: boolean;
}

export type ChatMode = 'cmd' | 'say' | 'global' | 'party';

export enum GameOption {
  // interface options
  RightClickCMDSend = 'rightClickCMDSend',
  AutoAttack = 'autoAttack',
  AutoJoin = 'autoJoin',
  DontAttackGreys = 'dontAttackGreys',
  HideLobbyWhilePlaying = 'hideLobbyWhileInGame',
  LockWindows = 'lockWindows',
  SuppressZeroDamage = 'suppressZeroDamageMessage',
  SuppressOutgoingDoT = 'suppressOutgoingDoTDamage',
  NoItemAnimations = 'noItemAnimations',
  EnterToggleCMD = 'enterToggleCMD',
  NoNPCModals = 'noNPCModals',
  PinLastTarget = 'pinLastTarget',
  DyingBorderWidth = 'dyingBorderWidth',
  DyingBorderPercent = 'dyingBorderPercent',
  ShouldSortFriendly = 'shouldSortFriendly',
  ShouldSortDistance = 'shouldSortDistance',
  ShrinkCharacterBoxes = 'shrinkCharacterBoxes',
  LockerTabs = 'lockerTabs',
  DebugUI = 'debugUI',
  SendBannerMessagesToChat = 'sendBannerMessagesToChat',
  BiggerGroundWindow = 'biggerGroundWindow',
  ShowHPValueInsteadOfPercent = 'showHPValueInsteadOfPercent',

  // sound options
  SoundBGM = 'playBGM',
  SoundSFX = 'playSFX',
  SoundNostalgia = 'playNostalgia',
  SoundMusicVolume = 'volumeMusic',
  SoundSFXVolume = 'volumeSFX',

  // debug options
  SpritesheetDecor = 'spritesheetDecorUrl',
  SpritesheetWalls = 'spritesheetWallsUrl',
  SpritesheetItems = 'spritesheetItemsUrl',
  SpritesheetCreatures = 'spritesheetCreaturesUrl',
  SpritesheetSwimming = 'spritesheetSwimmingUrl',
  SpritesheetTerrain = 'spritesheetTerrainUrl',
  SpritesheetEffects = 'spritesheetEffectsUrl',

  // other options
  OtherAutoExec = 'otherAutoExec',

  // custom options
  CustomCSS = 'customCSS',
}

export interface IWindowProps {
  x: number;
  y: number;
  width: number;
  height: number;
  hidden?: boolean;
}

export interface ISettings {
  accounts: IAccountSettings[];
  windows: Record<string, IWindowProps>;
  activeWindow: string;
  charSlot: number;
  lastCharSlot: number;
  wasKicked: boolean;
  assetHash: string;
  chatMode: ChatMode;
  logMode: 'All' | 'General' | 'Combat' | 'NPC';
  currentCommand: string;
  commandHistory: string[];
  characterView: 'Equipment' | 'Stats' | 'Skills' | 'Reputation';
  options: Record<GameOption, number | boolean | string>;
}
