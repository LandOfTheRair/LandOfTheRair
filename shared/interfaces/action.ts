
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

  validate(args?): boolean;
  act(game, { broadcast, emit }: WebsocketCallbacks, args?): Promise<void>;
}

export enum GameServerEvent {
  Default = '',

  Register = 'Auth:Emit:Register',
  Login = 'Auth:Emit:Login',
  Logout = 'Auth:Emit:Logout',

  SetMOTD = 'GM:Emit:SetMOTD',

  CharacterCreateInformation = 'Creator:Emit:CharacterSelect',

  DeleteCharacter = 'Selector:Emit:CharacterDelete',
  CreateCharacter = 'Selector:Emit:CharacterCreate',
  PlayCharacter = 'Selector:Emit:CharacterPlay',

  Chat = 'Chat:Emit:SendMessage',

  QuitGame = 'Game:Emit:QuitGame',

  DoCommand = 'Game:Emit:DoCommand'
}

export enum GameAction {
  Login = '[Account] Log in',
  Logout = '[Account] Log out',
  SetCharacterSlotInformation = '[Account] Set Charslot Info',

  ChatAddMessage = '[Chat] Add message',
  ChatSetMOTD = '[Chat] Set MOTD',
  ChatSetUserList = '[Chat] Set user list',
  ChatAddUser = '[Chat] Add user',
  ChatRemoveUser = '[Chat] Remove user',
  ChatUserEnterGame = '[Chat] User Enter Game',
  ChatUserLeaveGame = '[Chat] User Leave Game',

  SettingsSetAssetHash = '[Settings] Set server asset hash',

  SetCharacterCreateInformation = '[CharSelect] Set Create Info',

  GamePlay = '[Game] Play Game',
  GameQuit = '[Game] Quit Game',
  GameSetMap = '[Game] Set Map',
  GameSetPlayer = '[Game] Set Player',
  GamePatchPlayer = '[Game] Patch Player'
}

export enum GameServerResponse {
  Error = 'error',

  Login = 'Auth:Response:Login',
  UserJoin = 'Lobby:Response:UserJoin',
  UserLeave = 'Lobby:Response:UserLeave',

  Chat = 'Chat:Response:Message',

  CharacterCreateInformation = 'Creator:Response:CharacterSelect',
  CharacterCreate = 'Creator:Response:CharacterCreate',

  GameLog = 'Game:Response:Message'
}
