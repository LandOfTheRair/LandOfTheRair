
import { Injectable } from 'injection-js';

import { BaseService } from '../../interfaces';

@Injectable()
export class ItemCreator extends BaseService {

  constructor(
    // private content: ContentManager
  ) {
    super();
  }

  public init() {}

}
