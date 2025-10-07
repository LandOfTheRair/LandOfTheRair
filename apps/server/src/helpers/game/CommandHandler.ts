import { Injectable } from 'injection-js';
import { isObject, isString } from 'lodash';

import { canAct, isDead } from '@lotr/characters';
import type { ICharacter, IMacroCommandArgs } from '@lotr/interfaces';
import { consoleDebug, consoleLog } from '@lotr/logger';
import type { Player } from '../../models';
import { BaseService } from '../../models/BaseService';
import type { MacroCommand, SkillCommand } from '../../models/macro';
import { SpellCommand } from '../../models/macro';
import * as Commands from './commands';

const didYouMean = require('didyoumean2').default;

@Injectable()
export class CommandHandler extends BaseService {
  private commands: Record<string, MacroCommand> = {};
  private commandStrings: string[] = [];

  private parseArgs(args: string): string[] {
    return (args || '').split(' ');
  }

  // load all skills
  public init() {
    const baseSpellList = this.game.contentManager.getSpells();

    Object.values(Commands)
      .map((x) => new x(this.game))
      .forEach((command) => {
        const dataRef = (command as SpellCommand).spellDataRef;
        const spellRef = (command as SpellCommand).spellRef;
        if (dataRef) {
          delete baseSpellList[dataRef];
        }

        if (spellRef) {
          delete baseSpellList[spellRef];
        }

        this.addCommandAliases(command);
      });

    const remainingSpellsByName = Object.keys(baseSpellList).sort();
    remainingSpellsByName.forEach((spellName) => {
      let message = 'free-cast';

      const spellCommand = new SpellCommand(this.game);
      spellCommand.spellRef = spellName;
      spellCommand.requiresLearn = true;
      spellCommand.isAutomaticSpell = true;

      if (baseSpellList[spellName].spellMeta?.noHostileTarget) {
        message = 'ally-only';
        spellCommand.canTargetSelf = true;
        spellCommand.targetsFriendly = true;
      }

      if (baseSpellList[spellName].spellMeta?.targetsCaster) {
        message = 'self-only';
        spellCommand.canTargetSelf = true;
        spellCommand.targetsFriendly = true;
        spellCommand.noPlayerArgs = true;
      }

      consoleDebug(
        `CommandHandler:SpellInit`,
        `Initializing autospell ${spellName} (${message})...`,
      );

      spellCommand.aliases = [
        spellName.toLowerCase(),
        `cast ${spellName.toLowerCase()}`,
      ];

      this.addCommandAliases(spellCommand);
    });

    this.commandStrings = Object.keys(this.commands);
  }

  private addCommandAliases(command: MacroCommand): void {
    const aliases = command.aliases.filter(Boolean);

    aliases.forEach((alias) => {
      this.commands[alias.toLowerCase()] = command;
      this.commands[alias.toLowerCase().split(' ').join('')] = command;
    });
  }

  // get a ref to a skill
  public getSkillRef(name: string): SkillCommand {
    return this.commands[name.toLowerCase()] as SkillCommand;
  }

  // do the command for the player
  public async doCommand(player: Player, data, callbacks) {
    if (
      (player as ICharacter).takingOver &&
      !data.command.includes('@takeover')
    ) {
      this.game.messageHelper.sendLogMessageToPlayer(player, {
        message: 'You are in view-only mode.',
      });
      return;
    }

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
      spell: '',
    };

    if (data.args && isString(data.args)) {
      args.stringArgs = data.args;
      args.arrayArgs = this.parseArgs(data.args);
    } else if (data.args && isObject(data.args)) {
      args.objArgs = data.args;
    }

    // validate the command / prefixes
    const commandRef = this.getSkillRef(command);
    if (!commandRef) {
      const didyoumean = didYouMean(command, this.commandStrings);
      let message = `Command "${command}" does not exist.`;
      if (didyoumean) {
        message = `${message} Did you mean "${didyoumean}"?`;
      }

      this.game.messageHelper.sendLogMessageToPlayer(player, { message });
      return;
    }

    if (isDead(player) && !commandRef.canUseWhileDead) {
      this.game.messageHelper.sendLogMessageToPlayer(player, {
        message: "You can't do that while you're dead!",
      });
      return;
    }

    if (isInstant && !commandRef.canBeInstant) {
      this.game.messageHelper.sendLogMessageToPlayer(player, {
        message: `Command ${command} cannot be made instant.`,
      });
      return;
    }

    if (isFast && !commandRef.canBeFast) {
      this.game.messageHelper.sendLogMessageToPlayer(player, {
        message: `Command ${command} cannot be made fast.`,
      });
      return;
    }

    if (commandRef.isGMCommand && !player.isGM) {
      this.game.messageHelper.sendLogMessageToPlayer(player, {
        message: "You're not a GM.",
      });
      return;
    }

    if (commandRef.isGMCommand) {
      consoleLog(
        'GMCommand',
        `${player.name} running ${commandRef.aliases[0]} w/ "${args.stringArgs}".`,
      );
    }

    // check if we need to learn a spell before using it
    if (commandRef.requiresLearn) {
      args.spell = command;
    }

    // run or queue the command
    const callback = () => commandRef.execute(player, args);
    callback.args = args;

    if (isInstant) {
      if (!canAct(player)) return;
      callback();
    } else if (isFast) {
      player.actionQueue.fast.push(callback as any);
    } else {
      player.actionQueue.slow.push(callback as any);
    }
  }
}
