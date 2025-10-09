// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { Game } from '../../helpers';

import type {
  BaseSpell,
  DeepPartial,
  ICharacter,
  IItemEffect,
  ISpellData,
  IStatusEffectData,
  MessageInfo,
} from '@lotr/interfaces';
import { MessageType } from '@lotr/interfaces';

import { getStat } from '@lotr/characters';
import { effectGet } from '@lotr/content';
import { logCrashContextEntry } from '@lotr/logger';

export class Spell implements BaseSpell {
  constructor(protected game: Game) {}

  public sendMessage(
    character: ICharacter | string,
    message: MessageInfo,
    messageTypes: MessageType[] = [MessageType.Miscellaneous],
  ): void {
    this.game.messageHelper.sendLogMessageToPlayer(
      character,
      message,
      messageTypes,
    );
  }

  public formatMessage(
    message: string,
    args: { target?: string; caster?: string },
  ): string {
    return message
      .split('%target')
      .join(args.target ?? 'somebody')
      .split('%caster')
      .join(args.caster ?? 'somebody');
  }

  public cast(
    caster: ICharacter | undefined,
    target: ICharacter | undefined,
    override: Partial<IItemEffect>,
  ): void {}

  public getOverrideEffectInfo(
    caster: ICharacter | undefined,
    target: ICharacter | undefined,
    spellData: ISpellData,
    override: Partial<IItemEffect> = {},
  ): DeepPartial<IStatusEffectData> {
    let overrideCharges = override.charges || 0;
    let overrideDuration = override.duration || 0;
    let overridePotency = override.potency || 0;

    let baseTooltip: IStatusEffectData['tooltip'] = {
      desc: this.getUnformattedTooltipDesc(caster, target, spellData),
    };

    if (caster) {
      logCrashContextEntry(
        caster,
        `${caster.name}:GOEI -> ${spellData.spellName} -> ${target?.name || 'unknown'}`,
      );
    }

    if (spellData.spellMeta.linkedEffectName) {
      const effectInfo = effectGet(
        spellData.spellMeta.linkedEffectName,
        `GOEI:${caster?.name}:${spellData.spellName}`,
      )!;

      const { duration, durationScaleStat, durationScaleValue } =
        effectInfo.effect;

      if (
        caster &&
        !overrideDuration &&
        durationScaleStat &&
        durationScaleValue &&
        durationScaleValue !== -1
      ) {
        overrideDuration =
          getStat(caster, durationScaleStat) * durationScaleValue;
      }

      if (duration && !overrideDuration) {
        overrideDuration = effectInfo.effect.duration;
      }

      if (
        caster &&
        durationScaleStat &&
        durationScaleValue &&
        duration === -1 &&
        spellData.spellMeta.useDurationAsCharges
      ) {
        overrideCharges = overrideDuration;
        overrideDuration = -1;
      }

      if (effectInfo.effect.extra.potency) {
        overridePotency = effectInfo.effect.extra.potency;
      }

      baseTooltip = effectInfo.tooltip;
    }

    const effect = {
      effect: {
        duration:
          overrideDuration || this.getDuration(caster, target, spellData),
        extra: {
          charges:
            overrideCharges || this.getCharges(caster, target, spellData),
          potency:
            overridePotency || this.getPotency(caster, target, spellData),
        },
      },
      tooltip: baseTooltip,
    };

    return effect;
  }

  public getUnformattedTooltipDesc(
    caster: ICharacter | undefined,
    target: ICharacter | undefined,
    spellData: ISpellData,
  ): string {
    return '';
  }

  public getDuration(
    caster: ICharacter | undefined,
    target: ICharacter | undefined,
    spellData: ISpellData,
  ): number {
    return 0;
  }

  public getCharges(
    caster: ICharacter | undefined,
    target: ICharacter | undefined,
    spellData: ISpellData,
  ): number {
    return 0;
  }

  public getPotency(
    caster: ICharacter | undefined,
    target: ICharacter | undefined,
    spellData: ISpellData,
  ): number {
    return this.game.spellManager.getPotency(caster, target, spellData);
  }
}
