import { EquipHash, IItem, IMacroCommandArgs, IPlayer, ISimpleItem, ItemClass, ItemSlot } from '../../../../../interfaces';
import { MacroCommand } from '../../../../../models/macro';

const origins = [
  'R',  // right hand
  'L',  // left hand
  'E',  // equipment
  'B',  // belt
  'S',  // sack
];

const validDestinations = {
  E: ['B', 'S', 'L', 'R'],
  B: ['L', 'R', 'S', 'E'],
  S: ['L', 'R', 'B', 'E'],
  L: ['R', 'E', 'B', 'S'],
  R: ['L', 'E', 'B', 'S']
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

    if (slot === ItemSlot.Robe) {
      if (player.items.equipment[ItemSlot.Robe1] && player.items.equipment[ItemSlot.Robe2]) return null;
      if (player.items.equipment[ItemSlot.Robe1]) return ItemSlot.Robe2;
      if (player.items.equipment[ItemSlot.Robe2]) return ItemSlot.Robe1;
      return ItemSlot.Robe1;
    }

    return slot;
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
        if (!srcItem) return this.sendMessage(player, 'You aren\'t holding anything!');
        if (!this.game.playerInventoryHelper.canAddItemToSack(player, srcItem)) return this.sendMessage(player, 'Your sack is full.');

        this.game.playerInventoryHelper.addItemToSack(player, srcItem);
        this.game.characterHelper.setLeftHand(player, undefined);
        break;
      }

      case 'B': { // LtB
        if (!srcItem) return this.sendMessage(player, 'You aren\'t holding anything!');
        if (!this.game.playerInventoryHelper.canAddItemToBelt(player, srcItem)) return this.sendMessage(player, 'Your belt is full.');

        this.game.playerInventoryHelper.addItemToBelt(player, srcItem);
        this.game.characterHelper.setLeftHand(player, undefined);
        break;
      }

      case 'E': { // LtE
        if (!srcItem) return this.sendMessage(player, 'You aren\'t holding anything!');

        const equipSlot = this.getEquipmentSlot(player, srcItem);
        if (!equipSlot) return this.sendMessage(player, 'That item doesn\'t fit there.');

        this.game.characterHelper.setLeftHand(player, undefined);
        this.game.characterHelper.setEquipmentSlot(player, equipSlot, srcItem);

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
        if (!srcItem) return this.sendMessage(player, 'You aren\'t holding anything!');
        if (!this.game.playerInventoryHelper.canAddItemToSack(player, srcItem)) return this.sendMessage(player, 'Your sack is full.');

        this.game.playerInventoryHelper.addItemToSack(player, srcItem);
        this.game.characterHelper.setRightHand(player, undefined);
        break;
      }

      case 'B': { // RtB
        if (!srcItem) return this.sendMessage(player, 'You aren\'t holding anything!');
        if (!this.game.playerInventoryHelper.canAddItemToBelt(player, srcItem)) return this.sendMessage(player, 'Your belt is full.');

        this.game.playerInventoryHelper.addItemToBelt(player, srcItem);
        this.game.characterHelper.setRightHand(player, undefined);
        break;
      }

      case 'E': { // RtE
        if (!srcItem) return this.sendMessage(player, 'You aren\'t holding anything!');

        const equipSlot = this.getEquipmentSlot(player, srcItem);
        if (!equipSlot) return this.sendMessage(player, 'That item doesn\'t fit there.');

        this.game.characterHelper.setRightHand(player, undefined);
        this.game.characterHelper.setEquipmentSlot(player, equipSlot, srcItem);

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

      default: {
        this.game.logger.error('MoveItems', `handleE ${player.name} ${dest} ${origSlot} ${destSlot} went to default.`);
        return this.sendMessage(player, 'Something went wrong, please contact a GM.');
      }
    }

  }
}
