
export enum GameServerEvent {
  Register = 'Auth:register',
  Login = 'Auth:login',

  CharacterCreateInformation = 'Game:character_select',
  DeleteCharacter = 'Game:delete_character',
  CreateCharacter = 'Game:create_character',
  PlayCharacter = 'Game:play_character',

  Chat = 'Chat:send',

  Move = 'Game:move'
}

export enum GameServerResponse {
  Error = 'error_response',

  Login = 'Auth:login_response',
  UserJoin = 'Auth:join',
  UserLeave = 'Auth:leave',

  Chat = 'Chat:receive',

  CharacterCreateInformation = 'Game:character_select_response',
  CharacterCreate = 'Game:create_character_response'
}
