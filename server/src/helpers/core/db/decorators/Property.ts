
import { isUndefined } from 'lodash';

import { BaseEntity } from '../../../../models/BaseEntity';
import { MetadataStorage } from '../base/MetadataStorage';

interface PropertyOptions {
  hidden?: boolean;
  persist?: boolean;
}

export function Property(options?: PropertyOptions) {
  return (target: BaseEntity, propertyName: string) => {
    options = options || {};
    if (isUndefined(options.persist)) options.persist = true;

    // temporary props are not sent to client or are they saved, so they can't be patched
    if (!options.persist && options.hidden) {
      Object.defineProperty(target, propertyName, {
        get() { return undefined; },
        set(this: any, val: any) {
            Object.defineProperty(this, propertyName, {
                value: val,
                writable: true,
                enumerable: false,
                configurable: true
            });
        },
        enumerable: false
      });
    }

    MetadataStorage.setPropertyMetadata(target, propertyName, options);
  };
}
