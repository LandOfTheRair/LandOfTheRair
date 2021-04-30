
import { Injectable } from 'injection-js';
import { random } from 'lodash';
import nodemailer from 'nodemailer';
import { Account } from '../../models';

import { BaseService } from '../../models/BaseService';

@Injectable()
export class EmailHelper extends BaseService {

  private transport;

  public init() {
    if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
      this.game.logger.log('Email', 'No email or password set, skipping SMTP...');
      return;
    }

    this.transport = nodemailer.createTransport({
      service: process.env.SMTP_SERVICE || 'gmail',
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD
      }
    });
  }

  public async requestVerificationCode(account: Account): Promise<void> {
    if (!this.transport) throw new Error('SMTP not configured.');

    const code = `${random(100000, 999999)}`;
    account.verificationCode = code;

    const mail = {
      from: 'help@rair.land',
      replyTo: 'support@rair.land',
      to: account.email,
      subject: 'Your Land of the Rair Account Verification Code',
      text: `Hello ${account.username}, you requested to verify your email.

      Your email verification code is: ${code}

      If you did not request this, please reach out to support@rair.land.
      `
    };

    try {
      await this.transport.sendMail(mail);
    } catch (e) {
      this.game.logger.error('Email:RequestVerify', e);
      throw e;
    }
  }

}
