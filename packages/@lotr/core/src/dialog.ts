import type {
  IDialogChatAction,
  IDialogChatActionOption,
  INPC,
  IPlayer,
} from '@lotr/interfaces';
import { GameServerResponse } from '@lotr/interfaces';
import { transmissionSendResponseToAccount } from './transmission';

export function dialogSendNPCMessageToPlayer(
  player: IPlayer,
  npc: INPC,
  message: string,
  options: IDialogChatActionOption[] = [{ text: 'Leave', action: 'noop' }],
): void {
  if (options.length === 0) {
    options = [{ text: 'Leave', action: 'noop' }];
  }

  const formattedChat: IDialogChatAction = {
    message,
    displayTitle: npc.name,
    displayNPCName: npc.name,
    displayNPCSprite: npc.sprite,
    displayNPCUUID: npc.uuid,
    options,
  };

  transmissionSendResponseToAccount(
    player.username,
    GameServerResponse.DialogChat,
    formattedChat,
  );
}
