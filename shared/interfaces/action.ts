
export interface IServerResponse {
  type: GameServerResponse;
  error?: string;
  data?: any;
}

export type EmitterFunction = (id, args) => void;

interface WebsocketCallbacks {
  broadcast: EmitterFunction;
  emit: EmitterFunction;
  register: (username: string, socketId: string) => void;
  unregister: (username: string) => void;
}

export interface IServerAction {
  type: GameServerEvent;
  requiredKeys: string[];
  requiresLoggedIn: boolean;
  canBeUnattended: boolean;

  validate(args?): boolean;
  act(game, { broadcast, emit, register, unregister }: WebsocketCallbacks, args?): Promise<{ wasSuccess?: boolean, message?: string }>;
}

export enum GameServerEvent {
  Default = '',

  Register = 'Auth:Emit:Register',
  Login = 'Auth:Emit:Login',
  Logout = 'Auth:Emit:Logout',
  ChangePassword = 'Auth:Emit:ChangePassword',
  ChangeDiscordTag = 'Auth:Emit:ChangeDiscordTag',
  ChangeAlwaysOnline = 'Auth:Emit:ChangeAlwaysOnline',
  ChangeEventWatcher = 'Auth:Emit:ChangeEventWatcher',

  SetMOTD = 'GM:Emit:SetMOTD',
  BlockAndKickAll = 'GM:Emit:BlockAndKickAll',
  Announce = 'GM:Emit:Announce',

  CharacterCreateInformation = 'Creator:Emit:CharacterSelect',

  DeleteCharacter = 'Selector:Emit:CharacterDelete',
  CreateCharacter = 'Selector:Emit:CharacterCreate',
  PlayCharacter = 'Selector:Emit:CharacterPlay',

  Chat = 'Chat:Emit:SendMessage',

  QuitGame = 'Game:Emit:QuitGame',

  DoCommand = 'Game:Emit:DoCommand',

  PremiumBuy = 'Premium:Buy:Item',
  PremiumSilverBuy = 'Premium:SilverBuy:Item'
}

export enum GameServerResponse {
  Error = 'error',

  Login = 'Auth:Response:Login',
  UserJoin = 'Lobby:Response:UserJoin',
  UserLeave = 'Lobby:Response:UserLeave',
  UserCountUpdate = 'Lobby:Response:UserCountUpdate',

  Chat = 'Chat:Response:Message',

  CharacterCreateInformation = 'Creator:Response:CharacterSelect',
  CharacterCreate = 'Creator:Response:CharacterCreate',

  SetEvents = 'Event:Response:Set',
  CreateEvent = 'Event:Response:Create',
  DeleteEvent = 'Event:Response:Delete',

  GameLog = 'Game:Response:Message',
  SendNotification = 'Game:Response:Notification',
  SendImportantNotification = 'Game:Response:ImportantNotification',
  SendAlert = 'Game:Response:Alert',
  SendConfirm = 'Game:Response:Confirm',

  DialogChat = 'Game:Response:NPCDialog',
  PlaySFX = 'Game:Response:PlaySFX',
  PlayCFX = 'Game:Response:PlayCFX'
}

export enum GameAction {
  Login = '[Account] Log in',
  Logout = '[Account] Log out',
  SetCharacterSlotInformation = '[Account] Set Charslot Info',
  SetAccount = '[Account] Set Account',

  ChatAddMessage = '[Chat] Add message',
  ChatSetMOTD = '[Chat] Set MOTD',
  ChatSetUserList = '[Chat] Set user list',
  ChatAddUser = '[Chat] Add user',
  ChatRemoveUser = '[Chat] Remove user',
  ChatUserEnterGame = '[Chat] User Enter Game',
  ChatUserLeaveGame = '[Chat] User Leave Game',

  SettingsSetAssetHash = '[Settings] Set server asset hash',
  SettingsSetChatMode = '[Settings] Set Chat Mode',
  SettingsSetLogMode = '[Settings] Set Log Mode',
  SettingsSetCharacterView = '[Settings] Set Character View',

  SetCharacterCreateInformation = '[CharSelect] Set Create Info',

  EventSetList = '[Events] Set List',
  EventCreate = '[Events] Create Event',
  EventDelete = '[Events] Delete Event',

  GamePlay = '[Game] Play Game',
  GamePlayerReady = '[Game] Player Ready',
  GameQuit = '[Game] Quit Game',
  GameSetMap = '[Game] Set Map',
  GameSetPlayer = '[Game] Set Player',
  GameSetPosition = '[Game] Set Position',
  GamePatchPlayer = '[Game] Patch Player',
  GamePatchPlayerState = '[Game] Patch Player State',

  LogCurrentCommand = '[Game] Log Current Command',
  SetCurrentCommand = '[Game] Set Current Command',
  SetOption = '[Game] Set Option',

  SetCurrentTarget = '[Game] Set Current Target',
  SetCurrentItemTooltip = '[Game] Set Current Item Tooltip',
  ViewCharacterEquipment = '[Game] View Character Equipment',

  CreateCustomMacro = '[Macro] Create Custom',
  DeleteCustomMacro = '[Macro] Delete Custom',
  SetActiveMacro = '[Macro] Set Active Macro',
  LearnMacro = '[Macro] Learn Macro',
  SetActiveMacroBars = '[Macro] Set Active Bars',
  SetMacroBar = '[Macro] Set Macro Bars',
  SetDefaultMacros = '[Macros] Set Default Macros/Bars',
  ImportMacros = '[Macros] Import Macros',

  UpdateJournal = '[Journal] Update Journal',

  SettingsAddAccount = '[Settings] Add Quick Account',
  SettingsRemoveAccount = '[Settings] Remove Quick Account',
  SettingsUpdateWindowPosition = '[Settings] Update Window Position',
  SettingsSetDefaultWindowPosition = '[Settings] Set Default Window Position',
  SettingsResetWindowPositions = '[Settings] Reset Window Positions',
  SettingsHideWindow = '[Settings] Hide Window',
  SettingsShowWindow = '[Settings] Show Window',
  SettingsToggleWindow = '[Settings] Toggle Window',
  SettingsActiveWindow = '[Settings] Set Active Window',
  SettingsCharSlot = '[Settings] Set Char Slot',

  NPCActionShowTrainer = '[NPC] Show Trainer',
  NPCActionHideTrainer = '[NPC] Hide Trainer',
  NPCActionShowVendor = '[NPC] Show Vendor',
  NPCActionHideVendor = '[NPC] Hide Vendor',
  NPCActionShowBank = '[NPC] Show Bank',
  NPCActionHideBank = '[NPC] Hide Bank',

  LockerActionShow = '[Locker] Show Locker',
  LockerActionHide = '[Locker] Hide Locker',
}
