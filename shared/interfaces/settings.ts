
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
  HideLobbyWhilePlaying = 'hideLobbyWhileInGame',
  LockWindows = 'lockWindows',
  SuppressZeroDamage = 'suppressZeroDamageMessage',
  SuppressOutgoingDoT = 'suppressOutgoingDoTDamage',
  NoItemAnimations = 'noItemAnimations',
  EnterToggleCMD = 'enterToggleCMD',
  NoNPCModals = 'noNPCModals',
  PinLastTarget = 'pinLastTarget',
  ShouldSortFriendly = 'shouldSortFriendly',
  ShouldSortDistance = 'shouldSortDistance',

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
}

export interface ISettings {
  accounts: IAccountSettings[];
  windows: { [key: string]: { x: number, y: number, width: number, height: number, hidden?: boolean } };
  activeWindow: string;
  charSlot: number;
  wasKicked: boolean;
  assetHash: string;
  chatMode: ChatMode;
  logMode: 'All'|'General'|'Combat'|'NPC';
  currentCommand: string;
  commandHistory: string[];
  characterView: 'Equipment'|'Stats'|'Skills';
  options: Record<GameOption, number|boolean|string>;
}
