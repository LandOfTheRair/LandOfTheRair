
export class GroundWorker {

  async start() {
    console.log('GROUND', 'Start ground watcher...');

    this.sendMessage();
  }

  private sendMessage() {
    process.send!({ __ground: true });
  }

}
