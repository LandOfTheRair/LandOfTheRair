import {
  itemPropertyGet,
  skillGetDescription,
  textGidDescriptionGet,
} from '@lotr/content';
import { MacroCommand } from '@lotr/core';
import type { IMacroCommandArgs, IPlayer } from '@lotr/interfaces';
import { GameAction, ItemClass, Skill } from '@lotr/interfaces';

export class LookCommand extends MacroCommand {
  override aliases = ['look'];
  override canBeFast = true;
  override canUseWhileDead = false;

  override range() {
    return 4;
  }

  private getStringForNum(num: number) {
    if (num === 1) return 'a';
    if (num <= 3) return num;
    if (num <= 5) return 'a handful of';
    if (num <= 7) return 'a few';
    if (num <= 10) return 'some';
    if (num <= 20) return 'a pile of';
    if (num <= 50) return 'many';
    if (num <= 100) return 'a lot of';
    return 'zounds of';
  }

  private lookAtGround(player: IPlayer, args: IMacroCommandArgs) {
    args.callbacks.emit({
      action: GameAction.SettingsShowWindow,
      windowName: 'ground',
    });

    args.callbacks.emit({
      action: GameAction.SettingsActiveWindow,
      windowName: 'ground',
    });

    const state = this.game.worldManager.getMap(player.map)?.state;
    if (!state) return;

    const items = state.getEntireGround(player.x, player.y);

    const allTypes = Object.keys(items);

    // get type names
    const typesWithNames = allTypes
      .sort()
      .map((itemType) => {
        if (itemType === ItemClass.Coin && items[ItemClass.Coin][0]) {
          const coinItem = items[ItemClass.Coin][0].item;
          return `${coinItem.mods.value} ${coinItem.name.toLowerCase()}${(coinItem.mods.value ?? 0) > 1 ? 's' : ''}`;
        }

        // make sure we have items to check
        const len = items[itemType].reduce((prev, cur) => prev + cur.count, 0);
        if (len === 0) return '';

        // check if we should add an s to the end of the item
        const str = this.getStringForNum(len);
        const shouldS = !itemType.endsWith('s');

        // finalize the name
        return `${str} ${itemType.toLowerCase()}${len > 1 && shouldS ? 's' : ''}`;
      })
      .flat()
      .filter(Boolean);

    if (typesWithNames.length === 0) {
      this.sendMessage(player, 'You see nothing of interest.');
      return;
    }

    if (typesWithNames.length > 1) {
      typesWithNames[typesWithNames.length - 1] =
        `and ${typesWithNames[typesWithNames.length - 1]}`;
    }

    this.sendMessage(player, `You see ${typesWithNames.join(', ')}.`);
  }

  private lookAtObject(player: IPlayer, args: IMacroCommandArgs, obj: any) {
    switch (obj.type) {
      case 'Locker':
        return this.sendMessage(player, `You are looking at a locker.`);
      case 'StairsUp':
        return this.sendMessage(
          player,
          `You are looking at a staircase. It goes up.`,
        );
      case 'StairsDown':
        return this.sendMessage(
          player,
          `You are looking at a staircase. It goes down.`,
        );
      case 'ClimbUp':
        return this.sendMessage(
          player,
          `You are looking at a grip hold. It goes up.`,
        );
      case 'ClimbDown':
        return this.sendMessage(
          player,
          `You are looking at a grip hold. It goes down.`,
        );
      case 'Teleport':
        return this.sendMessage(
          player,
          `You are looking at space crackling with energy.`,
        );
      case 'Fall':
        return this.sendMessage(
          player,
          `You are looking at a hole. Unsurprisingly, it goes down.`,
        );
      case 'Fillable':
        return this.sendMessage(
          player,
          `You are looking at a place to refill your empty bottles.`,
        );
      case 'Door': {
        const { requireHeld, requireLockpick, skillRequired } =
          obj.properties ?? {};

        if (!requireHeld && !requireLockpick) {
          return this.sendMessage(
            player,
            `You are looking at a door. Most people open them, you know.`,
          );
        }

        const unlockMethods: string[] = [];

        if (requireLockpick) {
          unlockMethods.push(
            `could be lockpicked by a ${skillGetDescription(Skill.Thievery, skillRequired ?? 1)} thief`,
          );
        }

        if (requireHeld) {
          const itemRef = this.game.itemCreator.getSimpleItem(requireHeld);
          if (itemRef) {
            unlockMethods.push(
              `could be unlocked by ${itemPropertyGet(itemRef, 'desc')}`,
            );
          }
        }

        if (unlockMethods.length === 0) {
          return this.sendMessage(
            player,
            `You are looking at a door. It doesn't seem unlockable.`,
          );
        }

        this.sendMessage(
          player,
          `You are looking at a door. It: ${unlockMethods.join(', ')}.`,
        );
      }
    }
  }

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    const argString = args.stringArgs || 'ground';

    if (argString === 'ground') {
      this.lookAtGround(player, args);
      return;
    }

    const map = this.game.worldManager.getMap(player.map)?.map;
    if (!map) return;

    const target = this.getTarget(player, args.stringArgs, false, true);
    if (!target) return;

    const descObj = map.getInteractableAt(target.x, target.y);

    if (descObj) {
      this.lookAtObject(player, args, descObj);
      return;
    }

    const newDescObj = map.getDecorAt(target.x, target.y);
    const desc = textGidDescriptionGet(newDescObj?.gid);
    if (desc) {
      this.sendMessage(player, `In that direction: ${desc}`);
      return;
    }

    this.sendMessage(player, 'You see nothing of interest there.');
  }
}
