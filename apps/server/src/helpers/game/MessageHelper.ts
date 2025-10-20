import { Injectable } from 'injection-js';
import { set } from 'lodash';

import {
  transmissionResponseSendPlayer,
  transmissionSendResponseToAccount,
  worldCharacterGet,
  worldGetMapAndState,
  wsBroadcast,
} from '@lotr/core';
import type {
  ICharacter,
  IMessageHelper,
  MessageInfo,
  MessageVFX,
  SoundEffect,
} from '@lotr/interfaces';
import { GameAction, GameServerResponse, MessageType } from '@lotr/interfaces';
import { lobbyGetAccount } from '@lotr/lobby';
import { distanceFrom } from '@lotr/shared';
import type { Player } from '../../models';
import { BaseService } from '../../models/BaseService';

@Injectable()
export class MessageHelper extends BaseService implements IMessageHelper {
  public init() {}

  public sendLogMessageToPlayer(
    charOrUUID: ICharacter | string,
    { message, sfx, from, setTarget, overrideIfOnly, logInfo }: MessageInfo,
    messageTypes: MessageType[] = [MessageType.Miscellaneous],
    formatArgs: ICharacter[] = [],
  ): void {
    let uuid = (charOrUUID as ICharacter).uuid;
    if (!uuid) uuid = charOrUUID as string;

    const ref = worldCharacterGet(uuid);
    if (!ref) return;

    if (ref.takenOverBy) {
      this.sendLogMessageToPlayer(
        ref.takenOverBy,
        {
          message: `[as **${ref.name}**] ${message}`,
          sfx,
          from,
          setTarget,
          overrideIfOnly,
          logInfo,
        },
        messageTypes,
        formatArgs,
      );
    }

    if (ref.takingOver && !message.includes('[as')) {
      messageTypes.push(MessageType.Muted);
    }

    const account = lobbyGetAccount((ref as Player).username);
    if (!account) return;

    if (from) message = `**${from}**: ${message}`;

    let sendMessage = message;
    if (formatArgs.length > 0) {
      sendMessage = this.formatMessage(ref, sendMessage, formatArgs);
    }

    if (sfx) this.playSoundForPlayer(ref as Player, sfx, messageTypes);

    transmissionSendResponseToAccount(
      (ref as Player).username,
      GameServerResponse.GameLog,
      {
        type: GameServerResponse.GameLog,
        messageTypes,
        message: sendMessage,
        sfx,
        setTarget,
        overrideIfOnly,
        logInfo,
      },
    );
  }

  public sendLogMessageToRadius(
    character: ICharacter | { x: number; y: number; map: string },
    radius: number,
    {
      message,
      sfx,
      vfx,
      vfxTiles,
      vfxTimeout,
      from,
      setTarget,
      except,
    }: MessageInfo,
    messageTypes: MessageType[] = [MessageType.Miscellaneous],
    formatArgs: ICharacter[] = [],
  ): void {
    if (from) message = `**${from}**: ${message}`;

    const state = worldGetMapAndState(character.map)?.state;
    if (!state) return;

    const allPlayers = state.getAllPlayersInRange(character, radius);

    allPlayers.forEach((checkPlayer) => {
      const account = lobbyGetAccount((checkPlayer as Player).username);
      if (!account) return;

      if (except && except.includes(checkPlayer.uuid)) return;

      let sendMessage = message;
      if (formatArgs.length > 0) {
        sendMessage = this.formatMessage(checkPlayer, sendMessage, formatArgs);
      }

      if (sfx) {
        this.playSoundForPlayer(checkPlayer as Player, sfx, messageTypes);
      }

      transmissionSendResponseToAccount(
        (checkPlayer as Player).username,
        GameServerResponse.GameLog,
        {
          type: GameServerResponse.GameLog,
          messageTypes,
          message: sendMessage,
          sfx,
          vfx,
          vfxTiles,
          vfxTimeout,
          setTarget,
        },
      );
    });
  }

  public getVFXTilesForTile(
    center: { x: number; y: number; map: string },
    radius: number,
  ) {
    const tiles: { x: number; y: number }[] = [];

    for (let x = center.x - radius; x <= center.x + radius; x++) {
      for (let y = center.y - radius; y <= center.y + radius; y++) {
        const numStepsTo = this.game.movementHelper.numStepsTo(center, {
          x,
          y,
        });
        const distanceTo = distanceFrom(center, { x, y });

        if (numStepsTo === distanceTo) tiles.push({ x, y });
      }
    }

    return tiles;
  }

  public sendVFXMessageToRadius(
    character: ICharacter | { x: number; y: number; map: string },
    radius: number,
    { vfx, vfxTiles, vfxTimeout }: MessageVFX,
  ): void {
    const state = worldGetMapAndState(character.map)?.state;
    if (!state) return;

    const allPlayers = state.getAllPlayersInRange(character, radius);

    allPlayers.forEach((checkPlayer) => {
      const account = lobbyGetAccount((checkPlayer as Player).username);
      if (!account) return;

      transmissionSendResponseToAccount(
        (checkPlayer as Player).username,
        GameServerResponse.GameLog,
        {
          type: GameServerResponse.GameLog,
          vfx,
          vfxTiles,
          vfxTimeout,
        },
      );
    });
  }

  public sendSimpleMessage(
    character: ICharacter,
    message: string,
    sfx?: SoundEffect,
  ): void {
    this.sendLogMessageToPlayer(character, { message, sfx });
  }

  public sendPrivateMessage(
    from: ICharacter,
    to: ICharacter,
    message: string,
  ): void {
    this.sendLogMessageToPlayer(
      to,
      { message: `from **${from.name}**: ${message}` },
      [MessageType.Private, MessageType.PlayerChat],
    );
    this.sendLogMessageToPlayer(
      from,
      { message: `to **${to.name}**: ${message}` },
      [MessageType.Private, MessageType.PlayerChat],
    );
  }

  public broadcastSystemMessage(message: string): void {
    this.sendMessage('★System', message, true);
    this.game.discordHelper.broadcastSystemMessage(message);
  }

  public sendMessageToMap(map: string, msgInfo: MessageInfo): void {
    this.game.worldManager.getPlayersInMap(map).forEach((char) => {
      this.sendLogMessageToPlayer(char, msgInfo);
    });
  }

  public sendBannerMessageToPlayer(
    player: ICharacter,
    msgInfo: MessageInfo,
  ): void {
    this.sendLogMessageToPlayer(player, msgInfo, [MessageType.Banner]);
  }

  public sendBannerMessageToMap(map: string, msgInfo: MessageInfo): void {
    this.game.worldManager.getPlayersInMap(map).forEach((char) => {
      this.sendBannerMessageToPlayer(char, msgInfo);
    });
  }

  public sendMessageBannerAndChatToMap(map: string, msgInfo: MessageInfo) {
    this.sendBannerMessageToMap(map, msgInfo);
    this.sendMessageToMap(map, msgInfo);
  }

  public broadcastChatMessage(player: ICharacter, message: string): void {
    const account = lobbyGetAccount((player as Player).username);
    if (!account) return;

    const username = (player as Player).username;

    this.sendMessage(username, message);
  }

  public getSystemMessageObject(message: string) {
    return {
      action: GameAction.ChatAddMessage,
      timestamp: Date.now(),
      from: '★System',
      message,
    };
  }

  public sendMessage(
    from: string,
    message: string,
    fromDiscord = false,
    verified = false,
  ): void {
    message = message.trim();
    if (!message) return;

    const source =
      fromDiscord && from !== '★System' ? `${verified ? 'ᐎ' : ''}Discord` : '';

    wsBroadcast({
      action: GameAction.ChatAddMessage,
      timestamp: Date.now(),
      message,
      from,
      source,
    });

    wsBroadcast({
      type: GameServerResponse.Chat,
      timestamp: Date.now(),
      message,
      from,
      source,
    });

    if (!fromDiscord) {
      this.game.discordHelper.chatMessage(from, message);
    }
  }

  public formatMessage(
    target: ICharacter,
    message: string,
    formatArgs: any[],
  ): string {
    if (!formatArgs.length) return message;

    return [...formatArgs].reduce((str, c: ICharacter, idx) => {
      if (!c) return str.replace(new RegExp(`%${idx}`), 'somebody');

      let name = c.name;

      if (
        !this.game.visibilityHelper.canSee(
          target,
          c.x - target.x,
          c.y - target.y,
        ) ||
        !this.game.visibilityHelper.canSeeThroughStealthOf(target, c)
      ) {
        name = 'somebody';
      }
      if (target === c) name = 'yourself';
      return str.replace(new RegExp(`%${idx}`), name);
    }, message);
  }

  public playSoundForPlayer(
    player: Player,
    sfx: string,
    messageCategories: MessageType[],
  ): void {
    transmissionResponseSendPlayer(player, GameServerResponse.PlaySFX, {
      sfx,
      sfxTypes: messageCategories,
    });
  }

  public getMergeObjectFromArgs(args: string): any {
    const matches = args.match(/(?:[^\s"']+|['"][^'"]*["'])+/g) || [];

    const mergeObj = matches.reduce((obj, prop) => {
      const propData = prop.split('=');
      const key = propData[0];
      let val: string | number | boolean = propData[1];

      if (!val) return obj;

      val = val.trim();

      if (!isNaN(+val)) {
        val = +val;
      } else if (val.startsWith('"')) {
        val = val.substring(1, val.length - 1);
      }

      if (val === 'false') val = false;
      if (val === 'true') val = true;

      set(obj, key.trim(), val);
      return obj;
    }, {});

    return mergeObj;
  }
}
