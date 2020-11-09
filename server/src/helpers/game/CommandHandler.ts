import didYouMean from 'didyoumean2';
import { Injectable } from 'injection-js';
import { isObject, isString } from 'lodash';

import { BaseService, IMacroCommandArgs } from '../../interfaces';
import { Player } from '../../models';
import { MacroCommand } from '../../models/macro';
import * as Commands from './commands';
import { MessageHelper } from './MessageHelper';


@Injectable()
export class CommandHandler extends BaseService {

  constructor(
    private messageHelper: MessageHelper
  ) {
    super();
  }

  private commands: { [key: string]: MacroCommand } = {};
  private commandStrings: string[] = [];

  private parseArgs(args: string): string[] {
    // TODO: support target=$target dir=$dir,n,e,a for advanced macros, pos=$pos (for targetting in a particular position)
    return (args || '').split(' ');
  }

  public init() {
    Object.values(Commands).map(x => new x(this.game)).forEach(command => {
      command.aliases.forEach(alias => this.commands[alias] = command);
    });

    this.commandStrings = Object.keys(this.commands);
  }

  public doCommand(player: Player, data) {

    let command: string = data.command;

    // happens *immediately*
    const isInstant = command.startsWith('!');

    // happens on the fast loop
    const isFast = command.startsWith('~');

    // if instant or fast, strip prefix
    if (isInstant || isFast) {
      command = command.substring(1);
    }

    // parse command args
    const args: IMacroCommandArgs = {
      stringArgs: '',
      arrayArgs: [],
      objArgs: {},
      calledAlias: command
    };

    if (data.args && isString(data.args)) {
      args.stringArgs = data.args;
      args.arrayArgs = this.parseArgs(data.args);

    } else if (data.args && isObject(data.args)) {
      args.objArgs = data.args;
    }

    // validate the command / prefixes
    const commandRef = this.commands[command];
    if (!commandRef) {
      const didyoumean = didYouMean(command, this.commandStrings);
      let message = `Command "${command}" does not exist.`;
      if (didyoumean) {
        message = `${message} Did you mean "${didyoumean}"?`;
      }

      this.messageHelper.sendLogMessageToPlayer(player, { message });
      return;
    }

    if (isInstant && !commandRef.canBeInstant) {
      this.messageHelper.sendLogMessageToPlayer(player, { message: `Command ${command} cannot be made instant.` });
      return;
    }

    if (isFast && !commandRef.canBeFast) {
      this.messageHelper.sendLogMessageToPlayer(player, { message: `Command ${command} cannot be made fast.` });
      return;
    }

    if (commandRef.isGMCommand && !player.isGM) {
      this.messageHelper.sendLogMessageToPlayer(player, { message: `You're not a GM.` });
      return;
    }

    // run or queue the command
    const callback = () => commandRef.execute(player, args);

    if (isInstant) {
      callback();

    } else if (isFast) {
      player.actionQueue.fast.push(callback);

    } else {
      player.actionQueue.slow.push(callback);

    }
  }

}
