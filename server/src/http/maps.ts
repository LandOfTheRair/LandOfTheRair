
import processStats from 'process-stats';

const proc = processStats();

export class ProcessRoute {

  static setup(fastify: any) {
    fastify.get('/debug/process', async (req, res) => {
      res.send(proc());
    });
  }

}
