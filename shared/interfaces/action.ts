
export interface IServerResponse {
  type: GameServerResponse;
  error?: string;
  data?: any;
}

export interface IServerAction {
  type: GameServerEvent;
  requiredKeys: string[];

  validate(args?): boolean;
  act(game, args?): Promise<IServerResponse & any>;
}

export enum GameServerEvent {
  Default = '',

  Register = 'Auth:Emit:Register',
  Login = 'Auth:Emit:Login',

  CharacterCreateInformation = 'Creator:Emit:CharacterSelect',

  DeleteCharacter = 'Selector:Emit:CharacterDelete',
  CreateCharacter = 'Selector:Emit:CharacterCreate',
  PlayCharacter = 'Selector:Emit:CharacterPlay',

  Chat = 'Chat:Emit:SendMessage',

  Move = 'Game:Emit:Move'
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

  SetCharacterCreateInformation = '[CharSelect] Set Create Info'
}

export enum GameServerResponse {
  Error = 'error',

  Login = 'Auth:Response:Login',
  UserJoin = 'Lobby:Response:UserJoin',
  UserLeave = 'Lobby:Response:UserLeave',

  Chat = 'Chat:Response:Message',

  CharacterCreateInformation = 'Creator:Response:CharacterSelect',
  CharacterCreate = 'Creator:Response:CharacterCreate'
}