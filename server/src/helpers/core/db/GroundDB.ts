
import { Injectable } from 'injection-js';
import { BaseService } from '../../../interfaces';
import { Database } from '../Database';

@Injectable()
export class GroundDB extends BaseService {

  constructor(
    private db: Database
  ) {
    super();
  }

  public async init() {}
}
