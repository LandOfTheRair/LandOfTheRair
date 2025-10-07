import type { BaseClass, ClassConfig, IGameSettings } from '@lotr/interfaces';
import { get, isUndefined } from 'lodash';
import { coreSettings } from './core';

export function settingClassConfigGet<T extends keyof ClassConfig>(
  baseClass: BaseClass,
  key: T,
): ClassConfig[T] {
  const settings = coreSettings();

  const ret = settings.classConfig[baseClass][key];
  if (isUndefined(ret)) {
    throw new Error(`Class config key ${baseClass}->${key} was undefined.`);
  }

  return ret as ClassConfig[T];
}

export function settingGameGet(
  name: keyof IGameSettings,
  subKey?: string,
): any {
  const settings = coreSettings();

  if (!subKey) return settings[name];
  return get(settings[name], subKey);
}
