import { Currency, EquipHash, IGroundItem, IMacroCommandArgs, IPlayer, ISimpleItem, ItemClass, ItemSlot } from '../../../../../interfaces';
import { MacroCommand } from '../../../../../models/macro';

const origins = [
  'R',  // right hand
  'L',  // left hand
  'E',  // equipment
  'B',  // belt
  'S',  // sack
  'C',  // coin
  'G',  // ground
];

const validDestinations = {
  E: ['B', 'S', 'L', 'R', 'G'],
  B: ['L', 'R', 'S', 'E', 'G'],
  S: ['L', 'R', 'B', 'E', 'G'],
  L: ['R', 'E', 'B', 'S', 'G'],
  R: ['L', 'E', 'B', 'S', 'G'],
  C: ['R', 'L', 'G'],
  G: ['R', 'L', 'E', 'B', 'S']
};

const allAliases = origins.map(o => validDestinations[o].map(sub => `${o}t${sub}`)).flat();

export class MoveItems extends MacroCommand {

  aliases = allAliases;
  canBeFast = true;
  canBeInstant = true;

  execute(player: IPlayer, args: IMacroCommandArgs) {
    const [o, d] = args.calledAlias.split(' ')[0].split('t');

    if (!this[`handle${o}`]) return this.sendMessage(player, 'Invalid item move origin.');

    this[`handle${o}`](player, d, ...args.arrayArgs);
  }

  private doPrelimChecks(player: IPlayer, srcItem: ISimpleItem | undefined, dest: string, destSlot: string): boolean {
    if (!srcItem) return true;

    const isSackable = this.game.itemHelper.getItemProperty(srcItem, 'isSackable');
    const isBeltable = this.game.itemHelper.getItemProperty(srcItem, 'isBeltable');

    // Dest: S - Items must be sackable
    if (dest === 'S' && !isSackable) {
      this.sendMessage(player, 'That item cannot fit in your sack.');
      return false;
    }

    // Dest: B - Items must be beltable
    if (dest === 'B' && !isBeltable) {
      this.sendMessage(player, 'That item cannot fit in your belt.');
      return false;
    }

    return true;
  }

  private getEquipmentSlot(player: IPlayer, item: ISimpleItem): ItemSlot | null {
    const slot = EquipHash[this.game.itemHelper.getItemProperty(item, 'itemClass')];

    if (slot === ItemSlot.Ring) {
      if (player.items.equipment[ItemSlot.Ring1] && player.items.equipment[ItemSlot.Ring2]) return null;
      if (player.items.equipment[ItemSlot.Ring1]) return ItemSlot.Ring2;
      if (player.items.equipment[ItemSlot.Ring2]) return ItemSlot.Ring1;
      return ItemSlot.Ring1;
    }

    if (slot === ItemSlot.Armor) {
      if (player.items.equipment[ItemSlot.Armor]) return null;
    }

    if (slot === ItemSlot.Robe) {
      if (player.items.equipment[ItemSlot.Armor]
       && player.items.equipment[ItemSlot.Robe1]
       && player.items.equipment[ItemSlot.Robe2]) return null;

      if (!player.items.equipment[ItemSlot.Armor]) return ItemSlot.Armor;
      if (player.items.equipment[ItemSlot.Robe1]) return ItemSlot.Robe2;
      if (player.items.equipment[ItemSlot.Robe2]) return ItemSlot.Robe1;
      return ItemSlot.Robe1;
    }

    return slot;
  }

  // handle C as an origin
  handleC(player: IPlayer, dest: string, origSlot: string, destSlot: string) {
    if (!validDestinations.C.includes(dest)) return this.sendMessage(player, 'Invalid item move destination.');

    const amount = Math.min(player.currency[Currency.Gold] || 0, Math.floor(+origSlot));
    if (isNaN(amount) || amount < 0) return;

    const srcItem = this.game.itemCreator.getSimpleItem('Gold Coin');
    srcItem.mods.value = amount;
    this.game.playerHelper.loseCurrency(player, Currency.Gold, amount);

    switch (dest) {
      case 'R': { // CtR
        const rightHand = player.items.equipment[ItemSlot.RightHand];
        const leftHand = player.items.equipment[ItemSlot.LeftHand];

        if (rightHand && leftHand) return this.sendMessage(player, 'Your hands are full.');

        if (rightHand && !leftHand) {
          this.game.characterHelper.setLeftHand(player, rightHand);
          this.game.characterHelper.setRightHand(player, srcItem);

        } else if (!rightHand) {
          this.game.characterHelper.setRightHand(player, srcItem);
        }

        break;
      }

      case 'L': { // CtL
        const rightHand = player.items.equipment[ItemSlot.RightHand];
        const leftHand = player.items.equipment[ItemSlot.LeftHand];

        if (leftHand && rightHand) return this.sendMessage(player, 'Your hands are full.');

        if (leftHand && !rightHand) {
          this.game.characterHelper.setRightHand(player, leftHand);
          this.game.characterHelper.setLeftHand(player, srcItem);

        } else if (!leftHand) {
          this.game.characterHelper.setLeftHand(player, srcItem);
        }

        break;
      }

      case 'G': { // CtG
        const { state } = this.game.worldManager.getMap(player.map);
        state.addItemToGround(player.x, player.y, srcItem);

        break;
      }

      default: {
      this.game.logger.error('MoveItems', `handleC ${player.name} ${dest} ${origSlot} ${destSlot} went to default.`);
      return this.sendMessage(player, 'Something went wrong, please contact a GM.');
      }
    }

  }

  // handle L as an origin
  handleL(player: IPlayer, dest: string, origSlot: string, destSlot: string) {
    if (!validDestinations.L.includes(dest)) return this.sendMessage(player, 'Invalid item move destination.');
    const srcItem = player.items.equipment[ItemSlot.LeftHand];

    if (!this.doPrelimChecks(player, srcItem, dest, destSlot)) return;

    switch (dest) {
      case 'R': { // LtR
        const rightHand = player.items.equipment[ItemSlot.RightHand];

        this.game.characterHelper.setLeftHand(player, rightHand);
        this.game.characterHelper.setRightHand(player, srcItem);
        break;
      }

      case 'S': { // LtS
        if (!srcItem) return this.sendMessage(player, 'You aren\'t holding anything in that hand!');
        if (!this.game.playerInventoryHelper.canAddItemToSack(player, srcItem)) return this.sendMessage(player, 'Your sack is full.');

        this.game.playerInventoryHelper.addItemToSack(player, srcItem);
        this.game.characterHelper.setLeftHand(player, undefined);
        break;
      }

      case 'B': { // LtB
        if (!srcItem) return this.sendMessage(player, 'You aren\'t holding anything in that hand!');
        if (!this.game.playerInventoryHelper.canAddItemToBelt(player, srcItem)) return this.sendMessage(player, 'Your belt is full.');

        this.game.playerInventoryHelper.addItemToBelt(player, srcItem);
        this.game.characterHelper.setLeftHand(player, undefined);
        break;
      }

      case 'E': { // LtE
        if (!srcItem) return this.sendMessage(player, 'You aren\'t holding anything in that hand!');

        const equipSlot = this.getEquipmentSlot(player, srcItem);
        if (!equipSlot) return this.sendMessage(player, 'That item doesn\'t fit there.');

        this.game.characterHelper.setLeftHand(player, undefined);
        this.game.characterHelper.setEquipmentSlot(player, equipSlot, srcItem);

        break;
      }

      case 'G': { // LtG
        if (!srcItem) return this.sendMessage(player, 'You aren\'t holding anything in that hand!');
        const { state } = this.game.worldManager.getMap(player.map);

        this.game.characterHelper.setLeftHand(player, undefined);
        state.addItemToGround(player.x, player.y, srcItem);

        break;
      }

      default: {
        this.game.logger.error('MoveItems', `handleL ${player.name} ${dest} ${origSlot} ${destSlot} went to default.`);
        return this.sendMessage(player, 'Something went wrong, please contact a GM.');
      }
    }

  }

  // handle R as an origin
  handleR(player: IPlayer, dest: string, origSlot: string, destSlot: string) {
    if (!validDestinations.R.includes(dest)) return this.sendMessage(player, 'Invalid item move destination.');
    const srcItem = player.items.equipment[ItemSlot.RightHand];

    if (!this.doPrelimChecks(player, srcItem, dest, destSlot)) return;

    switch (dest) {
      case 'L': { // RtL
        const leftHand = player.items.equipment[ItemSlot.LeftHand];

        this.game.characterHelper.setLeftHand(player, srcItem);
        this.game.characterHelper.setRightHand(player, leftHand);
        break;
      }

      case 'S': { // RtS
        if (!srcItem) return this.sendMessage(player, 'You aren\'t holding anything in that hand!');
        if (!this.game.playerInventoryHelper.canAddItemToSack(player, srcItem)) return this.sendMessage(player, 'Your sack is full.');

        this.game.playerInventoryHelper.addItemToSack(player, srcItem);
        this.game.characterHelper.setRightHand(player, undefined);
        break;
      }

      case 'B': { // RtB
        if (!srcItem) return this.sendMessage(player, 'You aren\'t holding anything in that hand!');
        if (!this.game.playerInventoryHelper.canAddItemToBelt(player, srcItem)) return this.sendMessage(player, 'Your belt is full.');

        this.game.playerInventoryHelper.addItemToBelt(player, srcItem);
        this.game.characterHelper.setRightHand(player, undefined);
        break;
      }

      case 'E': { // RtE
        if (!srcItem) return this.sendMessage(player, 'You aren\'t holding anything in that hand!');

        const equipSlot = this.getEquipmentSlot(player, srcItem);
        if (!equipSlot) return this.sendMessage(player, 'That item doesn\'t fit there.');

        this.game.characterHelper.setRightHand(player, undefined);
        this.game.characterHelper.setEquipmentSlot(player, equipSlot, srcItem);

        break;
      }

      case 'G': { // RtG
        if (!srcItem) return this.sendMessage(player, 'You aren\'t holding anything in that hand!');
        const { state } = this.game.worldManager.getMap(player.map);

        this.game.characterHelper.setRightHand(player, undefined);
        state.addItemToGround(player.x, player.y, srcItem);

        break;
      }

      default: {
        this.game.logger.error('MoveItems', `handleR ${player.name} ${dest} ${origSlot} ${destSlot} went to default.`);
        return this.sendMessage(player, 'Something went wrong, please contact a GM.');
      }
    }

  }

  // handle E as an origin
  handleE(player: IPlayer, dest: string, origSlot: string, destSlot: string) {
    if (!validDestinations.E.includes(dest)) return this.sendMessage(player, 'Invalid item move destination.');
    const srcItem = player.items.equipment[origSlot];

    if (!srcItem) return this.sendMessage(player, 'You don\'t have anything equipped there!');
    if (!this.doPrelimChecks(player, srcItem, dest, destSlot)) return;

    switch (dest) {
      case 'R': { // EtR
        const rightHand = player.items.equipment[ItemSlot.RightHand];
        const leftHand = player.items.equipment[ItemSlot.LeftHand];

        if (rightHand && leftHand) return this.sendMessage(player, 'Your hands are full.');

        if (rightHand && !leftHand) {
          this.game.characterHelper.setEquipmentSlot(player, origSlot as ItemSlot, undefined);
          this.game.characterHelper.setLeftHand(player, rightHand);
          this.game.characterHelper.setRightHand(player, srcItem);

        } else if (!rightHand) {
          this.game.characterHelper.setEquipmentSlot(player, origSlot as ItemSlot, undefined);
          this.game.characterHelper.setRightHand(player, srcItem);
        }

        break;
      }

      case 'L': { // EtL
        const rightHand = player.items.equipment[ItemSlot.RightHand];
        const leftHand = player.items.equipment[ItemSlot.LeftHand];

        if (leftHand && rightHand) return this.sendMessage(player, 'Your hands are full.');

        if (leftHand && !rightHand) {
          this.game.characterHelper.setEquipmentSlot(player, origSlot as ItemSlot, undefined);
          this.game.characterHelper.setRightHand(player, leftHand);
          this.game.characterHelper.setLeftHand(player, srcItem);

        } else if (!leftHand) {
          this.game.characterHelper.setEquipmentSlot(player, origSlot as ItemSlot, undefined);
          this.game.characterHelper.setLeftHand(player, srcItem);
        }

        break;
      }

      case 'S': { // EtS
        if (!this.game.playerInventoryHelper.canAddItemToSack(player, srcItem)) return this.sendMessage(player, 'Your sack is full.');

        this.game.playerInventoryHelper.addItemToSack(player, srcItem);
        this.game.characterHelper.setEquipmentSlot(player, origSlot as ItemSlot, undefined);
        break;
      }

      case 'B': { // EtB
        if (!this.game.playerInventoryHelper.canAddItemToBelt(player, srcItem)) return this.sendMessage(player, 'Your belt is full.');

        this.game.playerInventoryHelper.addItemToBelt(player, srcItem);
        this.game.characterHelper.setEquipmentSlot(player, origSlot as ItemSlot, undefined);
        break;
      }

      case 'G': { // EtG
        this.game.characterHelper.setEquipmentSlot(player, origSlot as ItemSlot, undefined);

        const { state } = this.game.worldManager.getMap(player.map);
        state.addItemToGround(player.x, player.y, srcItem);

        break;
      }

      default: {
        this.game.logger.error('MoveItems', `handleE ${player.name} ${dest} ${origSlot} ${destSlot} went to default.`);
        return this.sendMessage(player, 'Something went wrong, please contact a GM.');
      }
    }

  }

  // handle B as an origin
  handleB(player: IPlayer, dest: string, origSlot: string, destSlot: string) {
    if (!validDestinations.B.includes(dest)) return this.sendMessage(player, 'Invalid item move destination.');

    const srcItem = player.items.belt.items[+origSlot];

    if (!srcItem) return this.sendMessage(player, 'You don\'t have an item there!');

    if (!this.doPrelimChecks(player, srcItem, dest, destSlot)) return;

    switch (dest) {
      case 'R': { // BtR
        const rightHand = player.items.equipment[ItemSlot.RightHand];
        const leftHand = player.items.equipment[ItemSlot.LeftHand];

        if (rightHand && leftHand) return this.sendMessage(player, 'Your hands are full.');

        if (rightHand && !leftHand) {
          const did = this.game.playerInventoryHelper.removeItemFromBelt(player, +origSlot);
          if (!did) return this.sendMessage(player, 'Could not take item from belt.');

          this.game.characterHelper.setLeftHand(player, rightHand);
          this.game.characterHelper.setRightHand(player, srcItem);

        } else if (!rightHand) {
          const did = this.game.playerInventoryHelper.removeItemFromBelt(player, +origSlot);
          if (!did) return this.sendMessage(player, 'Could not take item from belt.');

          this.game.characterHelper.setRightHand(player, srcItem);
        }

        break;
      }

      case 'L': { // BtL
        const rightHand = player.items.equipment[ItemSlot.RightHand];
        const leftHand = player.items.equipment[ItemSlot.LeftHand];

        if (leftHand && rightHand) return this.sendMessage(player, 'Your hands are full.');

        if (leftHand && !rightHand) {
          const did = this.game.playerInventoryHelper.removeItemFromBelt(player, +origSlot);
          if (!did) return this.sendMessage(player, 'Could not take item from belt.');

          this.game.characterHelper.setRightHand(player, leftHand);
          this.game.characterHelper.setLeftHand(player, srcItem);

        } else if (!leftHand) {
          const did = this.game.playerInventoryHelper.removeItemFromBelt(player, +origSlot);
          if (!did) return this.sendMessage(player, 'Could not take item from belt.');

          this.game.characterHelper.setLeftHand(player, srcItem);
        }

        break;
      }

      case 'S': { // BtS
        if (!this.game.playerInventoryHelper.canAddItemToSack(player, srcItem)) return this.sendMessage(player, 'Your sack is full.');

        this.game.playerInventoryHelper.removeItemFromBelt(player, +origSlot);
        this.game.playerInventoryHelper.addItemToSack(player, srcItem);
        break;
      }

      case 'E': { // BtE
        const equipSlot = this.getEquipmentSlot(player, srcItem);
        if (!equipSlot) return this.sendMessage(player, 'That item doesn\'t fit there.');

        const did = this.game.playerInventoryHelper.removeItemFromBelt(player, +origSlot);
        if (!did) return this.sendMessage(player, 'Could not take item from belt.');

        this.game.characterHelper.setEquipmentSlot(player, equipSlot, srcItem);

        break;
      }

      case 'G': { // BtG
        const did = this.game.playerInventoryHelper.removeItemFromBelt(player, +origSlot);
        if (!did) return this.sendMessage(player, 'Could not take item from belt.');

        const { state } = this.game.worldManager.getMap(player.map);
        state.addItemToGround(player.x, player.y, srcItem);

        break;
      }

      default: {
        this.game.logger.error('MoveItems', `handleE ${player.name} ${dest} ${origSlot} ${destSlot} went to default.`);
        return this.sendMessage(player, 'Something went wrong, please contact a GM.');
      }
    }

  }

  // handle S as an origin
  handleS(player: IPlayer, dest: string, origSlot: string, destSlot: string) {
    if (!validDestinations.S.includes(dest)) return this.sendMessage(player, 'Invalid item move destination.');

    const srcItem = player.items.sack.items[+origSlot];

    if (!srcItem) return this.sendMessage(player, 'You don\'t have an item there!');

    if (!this.doPrelimChecks(player, srcItem, dest, destSlot)) return;

    switch (dest) {
      case 'R': { // StR
        const rightHand = player.items.equipment[ItemSlot.RightHand];
        const leftHand = player.items.equipment[ItemSlot.LeftHand];

        if (rightHand && leftHand) return this.sendMessage(player, 'Your hands are full.');

        if (rightHand && !leftHand) {
          const did = this.game.playerInventoryHelper.removeItemFromSack(player, +origSlot);
          if (!did) return this.sendMessage(player, 'Could not take item from sack.');

          this.game.characterHelper.setLeftHand(player, rightHand);
          this.game.characterHelper.setRightHand(player, srcItem);

        } else if (!rightHand) {
          const did = this.game.playerInventoryHelper.removeItemFromSack(player, +origSlot);
          if (!did) return this.sendMessage(player, 'Could not take item from sack.');

          this.game.characterHelper.setRightHand(player, srcItem);
        }

        break;
      }

      case 'L': { // StL
        const rightHand = player.items.equipment[ItemSlot.RightHand];
        const leftHand = player.items.equipment[ItemSlot.LeftHand];

        if (leftHand && rightHand) return this.sendMessage(player, 'Your hands are full.');

        if (leftHand && !rightHand) {
          const did = this.game.playerInventoryHelper.removeItemFromSack(player, +origSlot);
          if (!did) return this.sendMessage(player, 'Could not take item from sack.');

          this.game.characterHelper.setRightHand(player, leftHand);
          this.game.characterHelper.setLeftHand(player, srcItem);

        } else if (!leftHand) {
          const did = this.game.playerInventoryHelper.removeItemFromSack(player, +origSlot);
          if (!did) return this.sendMessage(player, 'Could not take item from sack.');

          this.game.characterHelper.setLeftHand(player, srcItem);
        }

        break;
      }

      case 'B': { // StB
        if (!this.game.playerInventoryHelper.canAddItemToBelt(player, srcItem)) return this.sendMessage(player, 'Your belt is full.');

        this.game.playerInventoryHelper.removeItemFromSack(player, +origSlot);
        this.game.playerInventoryHelper.addItemToBelt(player, srcItem);
        break;
      }

      case 'E': { // StE
        const equipSlot = this.getEquipmentSlot(player, srcItem);
        if (!equipSlot) return this.sendMessage(player, 'That item doesn\'t fit there.');

        const did = this.game.playerInventoryHelper.removeItemFromSack(player, +origSlot);
        if (!did) return this.sendMessage(player, 'Could not take item from sack.');

        this.game.characterHelper.setEquipmentSlot(player, equipSlot, srcItem);

        break;
      }

      case 'G': { // StG
        const did = this.game.playerInventoryHelper.removeItemFromSack(player, +origSlot);
        if (!did) return this.sendMessage(player, 'Could not take item from sack.');

        const { state } = this.game.worldManager.getMap(player.map);
        state.addItemToGround(player.x, player.y, srcItem);

        break;
      }

      default: {
        this.game.logger.error('MoveItems', `handleE ${player.name} ${dest} ${origSlot} ${destSlot} went to default.`);
        return this.sendMessage(player, 'Something went wrong, please contact a GM.');
      }
    }
  }

  // handle G as an origin
  handleG(player: IPlayer, dest: string, origSlot: string, destSlot: string) {
    if (!validDestinations.G.includes(dest)) return this.sendMessage(player, 'Invalid item move destination.');

    const [itemClass, uuid] = origSlot.split(':');

    const { state } = this.game.worldManager.getMap(player.map);

    const items: IGroundItem[] = state.getItemsFromGround(player.x, player.y, itemClass as ItemClass, uuid);
    if (items.length === 0) return this.sendMessage(player, 'No items to grab.');

    switch (dest) {
      case 'R': { // GtR
        const rightHand = player.items.equipment[ItemSlot.RightHand];
        const leftHand = player.items.equipment[ItemSlot.LeftHand];

        if (rightHand && leftHand) return this.sendMessage(player, 'Your hands are full.');

        if (rightHand && !leftHand) {
          this.game.characterHelper.setLeftHand(player, rightHand);
          this.game.characterHelper.setRightHand(player, items[0].item);

        } else if (!rightHand) {
          this.game.characterHelper.setRightHand(player, items[0].item);
        }

        state.removeItemFromGround(player.x, player.y, itemClass as ItemClass, items[0].item.uuid, 1);

        break;
      }

      case 'L': { // GtL
        const rightHand = player.items.equipment[ItemSlot.RightHand];
        const leftHand = player.items.equipment[ItemSlot.LeftHand];

        if (leftHand && rightHand) return this.sendMessage(player, 'Your hands are full.');

        if (leftHand && !rightHand) {
          this.game.characterHelper.setRightHand(player, leftHand);
          this.game.characterHelper.setLeftHand(player, items[0].item);

        } else if (!leftHand) {
          this.game.characterHelper.setLeftHand(player, items[0].item);
        }

        state.removeItemFromGround(player.x, player.y, itemClass as ItemClass, items[0].item.uuid, 1);

        break;
      }

      case 'E': { // GtE
        const equipSlot = this.getEquipmentSlot(player, items[0].item);
        if (!equipSlot) return this.sendMessage(player, 'That item doesn\'t fit there.');

        this.game.characterHelper.setEquipmentSlot(player, equipSlot, items[0].item);
        state.removeItemFromGround(player.x, player.y, itemClass as ItemClass, items[0].item.uuid, 1);

        break;
      }

      case 'S': { // GtS

        const spaceLeft = this.game.playerInventoryHelper.sackSpaceLeft(player);
        const addItems: ISimpleItem[] = [];
        const uuidRemoveCounts: Record<string, number> = {};

        items.forEach(item => {
          if (addItems.length >= spaceLeft) return;

          for (let i = 0; i < item.count; i++) {
            if (addItems.length >= spaceLeft) break;

            uuidRemoveCounts[item.item.uuid] = uuidRemoveCounts[item.item.uuid] || 0;
            uuidRemoveCounts[item.item.uuid]++;

            addItems.push(this.game.itemCreator.rerollItem(item.item));
          }
        });

        addItems.forEach(item => {
          if (!this.game.playerInventoryHelper.canAddItemToSack(player, item)) return this.sendMessage(player, 'Your sack is full.');
          this.game.playerInventoryHelper.addItemToSack(player, item);
        });

        Object.keys(uuidRemoveCounts).forEach(removeUUID => {
          state.removeItemFromGround(player.x, player.y, itemClass as ItemClass, removeUUID, uuidRemoveCounts[removeUUID]);
        });

        break;
      }

      case 'B': { // GtB

        const spaceLeft = this.game.playerInventoryHelper.beltSpaceLeft(player);
        const addItems: ISimpleItem[] = [];
        const uuidRemoveCounts: Record<string, number> = {};

        items.forEach(item => {
          if (addItems.length >= spaceLeft) return;

          for (let i = 0; i < item.count; i++) {
            if (addItems.length >= spaceLeft) break;

            uuidRemoveCounts[item.item.uuid] = uuidRemoveCounts[item.item.uuid] || 0;
            uuidRemoveCounts[item.item.uuid]++;

            addItems.push(this.game.itemCreator.rerollItem(item.item));
          }
        });

        addItems.forEach(item => {
          if (!this.game.playerInventoryHelper.canAddItemToBelt(player, item)) return this.sendMessage(player, 'Your belt is full.');
          this.game.playerInventoryHelper.addItemToBelt(player, item);
        });

        Object.keys(uuidRemoveCounts).forEach(removeUUID => {
          state.removeItemFromGround(player.x, player.y, itemClass as ItemClass, removeUUID, uuidRemoveCounts[removeUUID]);
        });

        break;
      }

      default: {
        this.game.logger.error('MoveItems', `handleG ${player.name} ${dest} ${origSlot} ${destSlot} went to default.`);
        return this.sendMessage(player, 'Something went wrong, please contact a GM.');
      }
    }

  }
}
