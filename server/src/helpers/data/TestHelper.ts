import { Injectable } from 'injection-js';
import { Allegiance, BaseClass, IAccount, ICharacter } from '../../interfaces';
import { BaseService } from '../../models/BaseService';

@Injectable()
export class TestHelper extends BaseService {
  private overrideUserData: Partial<ICharacter> = {};

  public get autoApplyUserData(): Partial<ICharacter> {
    return this.overrideUserData;
  }

  async init() {
    if (!process.env.TEST_MODE) return;

    this.game.logger.log(
      'Game:TestMode',
      'Running in test mode. No data will be saved.',
    );

    this.createTestAccount();
    this.extractTestProps();
  }

  private async createTestAccount() {
    const username = process.env.TEST_USER_NAME || '';
    const password = process.env.TEST_USER_PASSWORD || '';

    if (!username || !password) {
      this.game.logger.log(
        'Game:TestMode',
        'Username or password not specified; skipping test user creation.',
      );
      return;
    }

    const prevAccount = await this.game.accountDB.getAccount(username);
    if (prevAccount) {
      this.game.logger.log(
        'Game:TestMode',
        `Username ${username} already exists; skipping test user creation.`,
      );
      return;
    }

    const account = await this.game.accountDB.createAccount({
      username,
      password,
      email: 'lotrtestuser@rair.land',
    } as IAccount);

    if (!account) {
      this.game.logger.error(
        'Game:TestMode',
        new Error('Unable to create test user.'),
      );
      return;
    }

    await this.game.accountDB.toggleGM(account);

    this.game.logger.log(
      'Game:TestMode',
      `Created account ${username} with password ${password}.`,
    );

    await this.game.characterDB.createCharacter(account, {
      slot: 0,
      name: 'Testmage',
      gender: 'female',
      allegiance: Allegiance.GM,
      baseclass: BaseClass.Mage,
      weapons: 'Staves',
    });

    await this.game.characterDB.createCharacter(account, {
      slot: 1,
      name: 'Testthief',
      gender: 'female',
      allegiance: Allegiance.GM,
      baseclass: BaseClass.Thief,
      weapons: 'Daggers',
    });

    await this.game.characterDB.createCharacter(account, {
      slot: 2,
      name: 'Testhealer',
      gender: 'female',
      allegiance: Allegiance.GM,
      baseclass: BaseClass.Healer,
      weapons: 'Maces',
    });

    await this.game.characterDB.createCharacter(account, {
      slot: 3,
      name: 'Testwarrior',
      gender: 'female',
      allegiance: Allegiance.GM,
      baseclass: BaseClass.Warrior,
      weapons: 'Swords',
    });

    this.game.logger.log(
      'Game:TestMode',
      'Created 4 characters: Testmage, Testthief, Testhealer, Testwarrior.',
    );
  }

  private extractTestProps() {
    try {
      const props = process.env.TEST_USER_PROPS || '{}';
      this.overrideUserData = JSON.parse(props)?.settings;

      this.game.logger.log(
        'Game:TestMode',
        'Overriding all characters with props: ' +
          JSON.stringify(this.overrideUserData),
      );
    } catch {
      this.game.logger.error(
        'Game:TestMode',
        new Error('Unable to parse TEST_USER_PROPS.'),
      );
    }
  }
}
