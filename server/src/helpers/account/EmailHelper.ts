import { Injectable } from 'injection-js';
import { random } from 'lodash';
import nodemailer from 'nodemailer';
import uuid from 'uuid/v4';
import { Account } from '../../models';

import { BaseService } from '../../models/BaseService';

@Injectable()
export class EmailHelper extends BaseService {
  private transport;

  public init() {
    if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
      this.game.logger.log(
        'Email',
        'No email or password set, skipping SMTP...',
      );
      return;
    }

    this.transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST || undefined,
      secure: true,
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  public async requestVerificationCode(account: Account): Promise<void> {
    if (!this.transport) throw new Error('SMTP not configured.');

    const hours =
      this.game.contentManager.getGameSetting(
        'auth',
        'verificationHourExpiration',
      ) ?? 1;

    const code = `${random(100000, 999999)}`;
    account.verificationCode = code;
    account.verificationExpiration = Date.now() + 3600 * hours * 1000;

    const mail = {
      from: process.env.SMTP_EMAIL,
      replyTo: 'support@rair.land',
      to: account.email,
      subject: 'Your Land of the Rair Account Verification Code',
      text: `Hello ${account.username}, you requested to verify your email.

      Your email verification code is: ${code}

      This code will be valid for ${hours} hour(s).

      If you did not request this, please reach out to support@rair.land.
      `,
    };

    try {
      await this.transport.sendMail(mail);
    } catch (e) {
      this.game.logger.error('Email:RequestVerify', e);
      throw e;
    }
  }

  public async requestTemporaryPassword(
    emailOrUsername: string,
  ): Promise<void> {
    let email = '';
    if (emailOrUsername.includes('@')) email = emailOrUsername;

    if (!email) {
      const account = await this.game.accountDB.getAccount(emailOrUsername);
      if (!account) {
        throw new Error('Account username specified, but not found.');
      }
      email = account.email;
    }

    const finalAccountUsername =
      await this.game.accountDB.getAccountUsernameForEmail(email);
    if (!finalAccountUsername) {
      throw new Error(
        'That email does not have an account associated with it.',
      );
    }

    const code = uuid().split('-').join('');

    this.game.accountDB.setTemporaryPassword(email, code);

    if (!this.transport) {
      throw new Error(
        `The mail server is not configured. Temporary password for email ${email} set to "${code}" (if email exists).`,
      );
    }

    const mail = {
      from: process.env.SMTP_EMAIL,
      replyTo: 'support@rair.land',
      to: email,
      subject: 'Your Land of the Rair Temporary Password',
      text: `Hello, you requested a temporary password.

      Your temporary password for "${finalAccountUsername}" is: ${code}

      Please note, this password will be automatically erased on your next login, and it did NOT replace your existing password.

      When you log in, reset your password immediately.

      If you did not request this, please reach out to support@rair.land.
      `,
    };

    try {
      await this.transport.sendMail(mail);
    } catch (e) {
      this.game.logger.error('Email:RequestTempPassword', e);
      throw e;
    }
  }
}
