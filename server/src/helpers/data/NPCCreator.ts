
import { Injectable } from 'injection-js';

import { BaseService } from '../../interfaces';
import { ContentManager } from './ContentManager';

@Injectable()
export class NPCCreator extends BaseService {

  constructor(
    private content: ContentManager
  ) {
    super();
  }

  public init() {}

}
