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
    caster: ICharacter | null,
    target: ICharacter | null,
    override: Partial<IItemEffect>,
  ): void {}

  public getOverrideEffectInfo(
    caster: ICharacter | null,
    target: ICharacter | null,
    spellData: ISpellData,
    override: Partial<IItemEffect> = {},
  ): DeepPartial<IStatusEffectData> {
    let baseTooltip: IStatusEffectData['tooltip'] = {
      desc: this.getUnformattedTooltipDesc(caster, target, spellData),
    };

    if (caster) {
      this.game.crashContext.logContextEntry(
        caster,
        `${caster.name}:GOEI -> ${spellData.spellName} -> ${target?.name || 'unknown'}`,
      );
    }

    if (spellData.spellMeta.linkedEffectName) {
      const effectInfo = this.game.contentManager.getEffect(
        spellData.spellMeta.linkedEffectName,
        `GOEI:${caster?.name}:${spellData.spellName}`,
      );

      const { duration, durationScaleStat, durationScaleValue } =
        effectInfo.effect;

      if (duration) {
        override.duration = effectInfo.effect.duration;
      }

      if (
        caster &&
        durationScaleStat &&
        durationScaleValue &&
        durationScaleValue !== -1
      ) {
        override.duration =
          getStat(caster, durationScaleStat) * durationScaleValue;
      }

      if (
        caster &&
        durationScaleStat &&
        durationScaleValue &&
        duration === -1 &&
        spellData.spellMeta.useDurationAsCharges
      ) {
        override.charges = override.duration;
        override.duration = -1;
      }

      if (effectInfo.effect.extra.potency) {
        override.potency = effectInfo.effect.extra.potency;
      }

      baseTooltip = effectInfo.tooltip;
    }

    const effect = {
      effect: {
        duration:
          override.duration ?? this.getDuration(caster, target, spellData),
        extra: {
          charges:
            override.charges ?? this.getCharges(caster, target, spellData),
          potency:
            override.potency ?? this.getPotency(caster, target, spellData),
        },
      },
      tooltip: baseTooltip,
    };

    return effect;
  }

  public getUnformattedTooltipDesc(
    caster: ICharacter | null,
    target: ICharacter | null,
    spellData: ISpellData,
  ): string {
    return '';
  }

  public getDuration(
    caster: ICharacter | null,
    target: ICharacter | null,
    spellData: ISpellData,
  ): number {
    return 0;
  }

  public getCharges(
    caster: ICharacter | null,
    target: ICharacter | null,
    spellData: ISpellData,
  ): number {
    return 0;
  }

  public getPotency(
    caster: ICharacter | null,
    target: ICharacter | null,
    spellData: ISpellData,
  ): number {
    return this.game.spellManager.getPotency(caster, target, spellData);
  }
}
