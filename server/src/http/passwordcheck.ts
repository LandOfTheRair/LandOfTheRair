import bcrypt from 'bcrypt';
import { Database } from '../helpers';

export class PasswordCheckRoute {

  static setup(fastify: any, {database}: {database: Database}) {
    fastify.post('/auth/password-check', async (req, res) => {
      if (!req.body) return res.code(400).send({ error: 'Need to specify username and password.' });

      const { username, password } = req.body;
      if (!username) return res.code(400).send({ error: 'Need to specify username.' });
      if (!password) return res.code(400).send({ error: 'Need to specify password.' });
      const account = await database.findUser(username);
      if (!account) return res.code(400).send({ error: 'That account does not exist.' });
      if (!bcrypt.compareSync(password, account.password)) return res.code(400).send({ error: 'Incorrect password.' });

      res.send({ success: true });
    });
  }
}
