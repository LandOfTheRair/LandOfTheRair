import { BaseClass } from '../interfaces';

export function isMPClass(classCheck: BaseClass) {
  return [BaseClass.Arcanist, BaseClass.Healer, BaseClass.Mage].includes(
    classCheck,
  );
}
