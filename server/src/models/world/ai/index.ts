
import { CrazedSaraxaAIBehavior } from './crazedsaraxa';
import { DedlaenEscortAI } from './dedlaenescort';
import { DefaultAIBehavior } from './default';
import { ResourceAI } from './resource';
import { SteffenLostChildAI } from './steffenlostchild';
import { TrainingDummyAI } from './trainingdummy';

export const AllAIBehaviors = {
  default: DefaultAIBehavior,
  resource: ResourceAI,
  trainingdummy: TrainingDummyAI,
  dedlaenescort: DedlaenEscortAI,
  steffenlostchild: SteffenLostChildAI,
  crazedsaraxa: CrazedSaraxaAIBehavior
};
