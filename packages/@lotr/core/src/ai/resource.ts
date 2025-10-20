import { DefaultAIBehavior } from './default';

export class ResourceAI extends DefaultAIBehavior {
  override tick(): void {
    this.resetAgro(true);
  }
}
