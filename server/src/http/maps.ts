
import processStats from 'process-stats';

export class ProcessRoute {

  static setup(fastify: any) {
    fastify.get('/debug/process', async () => processStats());
  }

}
