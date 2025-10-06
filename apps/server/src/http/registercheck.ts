import type { Database } from '../helpers';

export class RegisterCheckRoute {

  static setup(fastify: any, { database }: { database: Database }) {
    fastify.post('/auth/register-check', async (req, res) => {
      if (!req.body) return res.code(400).send({ error: 'Need to specify username and email.' });

      const { username, email, password } = req.body;
      if (!username) return res.code(400).send({ error: 'Need to specify username.' });
      if (!password) return res.code(400).send({ error: 'Need to specify password.' });
      if (!email) return res.code(400).send({ error: 'Need to specify email.' });

      if (/[^A-Za-z0-9]/.test(username)) return res.code(400).send({ error: 'Username must only have letters and numbers.' });
      if (username.length <= 2)          return res.code(400).send({ error: 'Username must be >2 characters.' });
      if (username.length > 20)          return res.code(400).send({ error: 'Username must be <20 characters.' });

      if (password.length < 11)          return res.code(400).send({ error: 'Password must be >10 characters.' });
      if (password.length > 256)         return res.code(400).send({ error: 'Password must be <256 characters.' });

      if (!email.includes('@')
      || !email.includes('.'))           return res.code(400).send({ error: 'Email must match basic format.' });

      const account = await database.findUser(username);
      if (account) return res.code(400).send({ error: 'That username is already taken.' });

      const accountE = await database.findUserByEmail(email);
      if (accountE) return res.code(400).send({ error: 'That email is already taken.' });

      res.send({ success: true });
    });
  }
}
