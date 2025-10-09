import type { IStatusEffectData } from '@lotr/interfaces';

export function formatEffectMessage(
  message: string,
  effectData: IStatusEffectData,
): string {
  const potency = Math.floor(effectData.effect.extra.potency ?? 0);
  const potency2 = Math.floor(potency / 2);
  const potency5 = Math.floor(potency / 5);
  const potency10 = Math.floor(potency / 10);
  return (message || '')
    .split('%potency10')
    .join(potency10.toLocaleString())
    .split('%potency5')
    .join(potency5.toLocaleString())
    .split('%potency2')
    .join(potency2.toLocaleString())
    .split('%potency')
    .join(potency.toLocaleString());
}
