import { Injectable } from 'injection-js';
import { template } from 'lodash';

import { BaseService, GameServerResponse, IDialogAction, IDialogActionType,
  IDialogChatAction, IDialogChatActionOption, IDialogRequirement, INPC,
  IPlayer, MessageType, Stat } from '../../interfaces';

interface IActionResult {
  messages: string[];
  shouldContinue: boolean;
}

@Injectable()
export class DialogActionHelper extends BaseService {

  public init() {}

  public async handleDialog(player: IPlayer, npc: INPC, command: string): Promise<void> {
    const messages = await (npc as any).dialogParser.parse(command, { player });
    (messages || []).forEach(message => {
      const msg = `${npc.name}: ${message}`;
      this.game.messageHelper.sendLogMessageToPlayer(player, { message: msg }, [MessageType.NPCChatter]);
    });
  }

  public handleAction(action: IDialogAction, npc: INPC, player: IPlayer): IActionResult {
    const actions: Record<IDialogActionType, (act, npc, player) => IActionResult> = {
      [IDialogActionType.Chat]:         this.handleChatAction,
      [IDialogActionType.CheckItem]:    this.handleCheckItemAction,
      [IDialogActionType.TakeItem]:     this.handleTakeItemAction,
      [IDialogActionType.GiveItem]:     this.handleGiveItemAction,
      [IDialogActionType.GiveEffect]:   this.handleGiveEffectAction
    };

    return actions[action.type].bind(this)(action, npc, player);
  }

  private handleChatAction(action: IDialogChatAction, npc: INPC, player: IPlayer): IActionResult {

    const maxDistance = action.maxDistance ?? 3;
    if (this.game.directionHelper.distFrom(player, npc) > maxDistance) {
      return { messages: ['Please come closer.'], shouldContinue: false };
    }

    const formattedChat: IDialogChatAction = {
      message: template(action.message)(player),
      displayNPCName: npc.name,
      displayNPCSprite: npc.sprite,
      displayNPCUUID: npc.uuid,
      options: action.options
        .map(x => {
          if (x.requirement && !this.meetsRequirement(player, x.requirement)) return null;
          return {
            text: template(x.text)(player),
            action: x.action
          };
        })
        .filter(Boolean) as IDialogChatActionOption[]
    };

    this.game.messageHelper.sendLogMessageToPlayer(player, { message: formattedChat.message }, [MessageType.NPCChatter]);
    this.game.transmissionHelper.sendResponseToAccount(player.username, GameServerResponse.DialogChat, formattedChat);

    return { messages: [], shouldContinue: true };
  }

  private handleCheckItemAction(action: IDialogChatAction, npc: INPC, player: IPlayer): IActionResult {
    return { messages: [], shouldContinue: true };
  }

  private handleTakeItemAction(action: IDialogChatAction, npc: INPC, player: IPlayer): IActionResult {
    return { messages: [], shouldContinue: true };
  }

  private handleGiveItemAction(action: IDialogChatAction, npc: INPC, player: IPlayer): IActionResult {
    return { messages: [], shouldContinue: true };
  }

  private handleGiveEffectAction(action: IDialogChatAction, npc: INPC, player: IPlayer): IActionResult {
    return { messages: [], shouldContinue: true };
  }

  private meetsRequirement(player: IPlayer, requirement: IDialogRequirement): boolean {
    if (requirement.stat && requirement.statValue) {
      const stat = this.game.characterHelper.getStat(player, requirement.stat as Stat);
      if (stat < requirement.statValue) return false;
    }

    return true;
  }
}
