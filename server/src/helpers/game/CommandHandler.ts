import didYouMean from 'didyoumean2';
import { Injectable } from 'injection-js';
import { isObject, isString } from 'lodash';

import { IMacroCommandArgs } from '../../interfaces';
import { BaseService, Player } from '../../models';
import { MacroCommand, SkillCommand } from '../../models/macro';
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

  // load all skills
  public init() {
    Object.values(Commands).map(x => new x(this.game)).forEach(command => {
      command.aliases.forEach(alias => this.commands[alias.toLowerCase()] = command);
    });

    this.commandStrings = Object.keys(this.commands);
  }

  // get a ref to a skill
  public getSkillRef(name: string): SkillCommand {
    return this.commands[name.toLowerCase()] as SkillCommand;
  }

  // do the command for the player
  public doCommand(player: Player, data, callbacks) {

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
      overrideEffect: undefined,
      calledAlias: command,
      callbacks,
      spell: ''
    };

    if (data.args && isString(data.args)) {
      args.stringArgs = data.args;
      args.arrayArgs = this.parseArgs(data.args);

    } else if (data.args && isObject(data.args)) {
      args.objArgs = data.args;
    }

    // validate the command / prefixes
    const commandRef = this.commands[command.toLowerCase()];
    if (!commandRef) {
      const didyoumean = didYouMean(command, this.commandStrings);
      let message = `Command "${command}" does not exist.`;
      if (didyoumean) {
        message = `${message} Did you mean "${didyoumean}"?`;
      }

      this.messageHelper.sendLogMessageToPlayer(player, { message });
      return;
    }

    if (this.game.characterHelper.isDead(player) && !commandRef.canUseWhileDead) {
      this.messageHelper.sendLogMessageToPlayer(player, { message: `You can't do that while you're dead!` });
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

    if (commandRef.isGMCommand) {
      this.game.logger.log(`GMCommand`, `${player.name} running ${commandRef.aliases[0]} w/ "${args.stringArgs}".`);
    }

    // check if we need to learn a spell before using it
    if (commandRef.requiresLearn) {
      args.spell = command;
    }

    // run or queue the command
    const callback = () => commandRef.execute(player, args);
    callback.args = args;

    if (isInstant) {
      callback();

    } else if (isFast) {
      player.actionQueue.fast.push(callback as any);

    } else {
      player.actionQueue.slow.push(callback as any);

    }
  }

}
