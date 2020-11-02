
import { Injectable } from 'injection-js';
import uuid from 'uuid/v4';

import { BaseService, ISimpleItem } from '../../interfaces';
import { ContentManager } from './ContentManager';

// functions related to CREATING an item
// not to be confused with ItemHelper which is for HELPER FUNCTIONS that MODIFY ITEMS
@Injectable()
export class ItemCreator extends BaseService {

  constructor(
    private content: ContentManager
  ) {
    super();
  }

  public init() {}

  // get an item that can be equipped
  public getSimpleItem(itemName: string): ISimpleItem {
    const itemDefinition = this.content.getItemDefinition(itemName);
    if (!itemDefinition) throw new Error(`Item ${itemName} does not exist and cannot be created.`);

    return { name: itemName, uuid: uuid(), mods: {} };
  }

}
