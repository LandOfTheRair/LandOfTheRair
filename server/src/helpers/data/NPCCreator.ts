import { Inject, Singleton } from 'typescript-ioc';

import { BaseService } from '../../interfaces';
import { ContentManager } from './ContentManager';

@Singleton
export class NPCCreator extends BaseService {

  @Inject private content: ContentManager;

  public init() {}

}
