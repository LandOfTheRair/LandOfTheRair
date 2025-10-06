import type { ICharacter } from '@lotr/interfaces';
import { Injectable } from 'injection-js';
import { BaseService } from '../../models/BaseService';

@Injectable()
export class CrashContextManager extends BaseService {
  private context: string[] = [];

  public init() {}

  public getCurrentContext(): string[] {
    return this.context;
  }

  public logContextEntry(char: ICharacter, entry: string): void {
    const message = `${char.map}:${char.x},${char.y}|${entry}`;
    this.context.push(message);
    if (this.context.length > 300) this.context.shift();

    if (process.env.LOG_CRASH_CONTEXT) {
      this.game.logger.log('CrashContext', message);
    }
  }
}
