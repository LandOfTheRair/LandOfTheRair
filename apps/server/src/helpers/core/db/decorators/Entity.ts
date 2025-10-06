import { MetadataStorage } from '../base';

export function Entity() {
  return (target) => {
    MetadataStorage.assignEntityMetadata(target);
    return target;
  };
}
