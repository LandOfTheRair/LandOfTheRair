/* eslint-disable prefer-arrow/prefer-arrow-functions */

import { MetadataStorage } from '../base';

export function Entity() {
  return (target) => {
    MetadataStorage.assignEntityMetadata(target);
    return target;
  };
}
