import { Singleton } from 'typescript-ioc';
import { BaseService, IPlayer } from '../../interfaces';
import * as Commands from './commands';


@Singleton
export class CommandHandler extends BaseService {

  private parseArgs(args: string): string[] {
    // TODO: support target=$target dir=$dir,n,e,a for advanced macros, pos=$pos (for targetting in a particular position)
    return (args || '').split(' ');
  }

  public init() {}

  public doCommand(player: IPlayer, data) {

    const command = data.command;
    const args = this.parseArgs(data.args);

    console.log(command, args, Commands);

    // TODO: add to command queue for player; deal with fast commands (~)
  }

}
