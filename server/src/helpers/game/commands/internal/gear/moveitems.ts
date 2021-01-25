import { Currency, EquipHash, IGroundItem, IMacroCommandArgs,
  INPC, IPlayer, ISimpleItem, ItemClass, ItemSlot } from '../../../../../interfaces';
import { MacroCommand } from '../../../../../models/macro';
import { VendorBehavior } from '../../../../../models/world/ai/behaviors';

const origins = [
  'R',  // right hand
  'L',  // left hand
  'E',  // equipment
  'B',  // belt
  'S',  // sack
  'C',  // coin
  'G',  // ground
  'M',  // merchant
  'O',  // Obtainagain (buyback)
];

const validDestinations = {
  E: ['B', 'S', 'L', 'R', 'G'],
  B: ['L', 'R', 'S', 'E', 'G', 'M'],
  S: ['L', 'R', 'B', 'E', 'G', 'M'],
  L: ['R', 'E', 'B', 'S', 'G', 'M'],
  R: ['L', 'E', 'B', 'S', 'G', 'M'],
  C: ['R', 'L', 'G'],
  G: ['R', 'L', 'E', 'B', 'S'],
  M: ['R', 'L', 'B', 'S'],
  O: ['R', 'L', 'B', 'S']
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
    this.doPostChecks(player, o, d);
  }

  private doPostChecks(player: IPlayer, srcSlot: string, destSlot: string): void {
    const updatePlayerSlots =    { E: true, L: true, R: true };
    const updateGroundSlots =    { G: true };
    const updateEquipmentSlots = { R: true, L: true, E: true };

    const { state } = this.game.worldManager.getMap(player.map);
    if (updatePlayerSlots[srcSlot] || updatePlayerSlots[destSlot]) state.triggerPlayerUpdateInRadius(player.x, player.y);
    if (updateGroundSlots[srcSlot] || updateGroundSlots[destSlot]) state.triggerGroundUpdateInRadius(player.x, player.y);

    if (updateEquipmentSlots[srcSlot] || updateEquipmentSlots[destSlot]) {
      this.game.characterHelper.recalculateEverything(player);
    }
  }

  private doPrelimChecks(
    player: IPlayer, srcItem: ISimpleItem | undefined, src: string, srcSlot: string, dest: string, destSlot: string
  ): boolean {
    if (!srcItem) return true;

    const isSackable = this.game.itemHelper.getItemProperty(srcItem, 'isSackable');
    const isBeltable = this.game.itemHelper.getItemProperty(srcItem, 'isBeltable');

    const itemClass = this.game.itemHelper.getItemProperty(srcItem, 'itemClass');
    const succorInfo = this.game.itemHelper.getItemProperty(srcItem, 'succorInfo');
    if (dest === 'G' && succorInfo) {

      let itemSlot: ItemSlot = srcSlot as ItemSlot;
      let retVal = false;

      if (src !== 'L' && src !== 'R') {
        const hand = this.game.characterHelper.getEmptyHand(player);
        if (!hand) {
          this.sendMessage(player, 'You need an empty hand to do that!');
          return false;
        }

        itemSlot = hand;
        retVal = true;
      }

      this.game.characterHelper.setEquipmentSlot(player, itemSlot, srcItem);
      this.game.itemHelper.useItemInSlot(player, itemSlot);
      return retVal;
    }

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

    // Dest: E - Items must be able to be used by the equipper
    if (dest === 'E' && !this.game.itemHelper.canGetBenefitsFromItem(player, srcItem)) {
      this.sendMessage(player, 'You cannot equip that item!');
      return false;
    }

    // if we're sending to a merchant, make sure we're in range first and we can sell the item
    if (dest === 'M') {
      if (!destSlot) {
        this.sendMessage(player, 'You do not see anyone nearby!');
        return false;
      }

      const npc: INPC = this.game.targettingHelper.getFirstPossibleTargetInViewRange(player, destSlot) as INPC;
      if (!npc) {
        this.sendMessage(player, 'You do not see that person.');
        return false;
      }

      const vendorBehavior: VendorBehavior = (npc.behaviors || []).find(b => (b as VendorBehavior).vendorItems) as VendorBehavior;
      if (!vendorBehavior) {
        this.sendMessage(player, 'That person is not a merchant!');
        return false;
      }

      if (this.game.directionHelper.distFrom(player, npc) > 2) {
        this.sendMessage(player, 'You are too far away from that person!');
        return false;
      }

      if (!this.game.itemHelper.isOwnedBy(player, srcItem)) {
        this.sendMessage(player, 'You do not own that item!');
        return false;
      }

      if (itemClass === ItemClass.Corpse) {
        this.sendMessage(player, 'Ew! Get that off my counter.');
        return false;
      }

      if (itemClass === ItemClass.Coin) {
        this.sendMessage(player, 'Why would you think I would buy currency?');
        return false;
      }
    }

    // buying an item back
    if (src === 'O') {
      const [npcUUID, itemSlot] = srcSlot.split(':');

      // make sure npc is nearby
      const npc = this.game.targettingHelper.getFirstPossibleTargetInViewRange(player, npcUUID);
      if (!npc) {
        this.sendMessage(player, 'You do not see that person.');
        return false;
      }

      if (this.game.directionHelper.distFrom(player, npc) > 2) {
        this.sendMessage(player, 'You are too far away from that person!');
        return false;
      }

      // make sure we can buy it
      const buybackItem = player.items.buyback[+itemSlot];
      if (!buybackItem || !buybackItem.mods.buybackValue) {
        this.sendMessage(player, 'You cannot buy back that item!');
        return false;
      }

      if (!this.game.currencyHelper.hasCurrency(player, buybackItem.mods.buybackValue ?? 0, Currency.Gold)) {
        this.sendMessage(player, 'You cannot afford to buy that item back!');
        return false;
      }
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

    const value = this.game.userInputHelper.cleanNumber(origSlot, 0, { floor: true });
    const amount = Math.min(this.game.currencyHelper.getCurrency(player), value);
    if (amount <= 0) return;

    const srcItem = this.game.itemCreator.getGold(amount);
    this.game.currencyHelper.loseCurrency(player, amount, Currency.Gold);

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

    if (!this.doPrelimChecks(player, srcItem, 'L', origSlot, dest, destSlot)) return;

    switch (dest) {
    case 'R': { // LtR
      const rightHand = player.items.equipment[ItemSlot.RightHand];

      this.game.characterHelper.setLeftHand(player, rightHand);
      this.game.characterHelper.setRightHand(player, srcItem);
      break;
    }

    case 'S': { // LtS
      if (!srcItem) return this.sendMessage(player, 'You aren\'t holding anything in that hand!');
      if (!this.game.inventoryHelper.canAddItemToSack(player, srcItem)) return this.sendMessage(player, 'Your sack is full.');

      this.game.inventoryHelper.addItemToSack(player, srcItem);
      this.game.characterHelper.setLeftHand(player, undefined);
      break;
    }

    case 'B': { // LtB
      if (!srcItem) return this.sendMessage(player, 'You aren\'t holding anything in that hand!');
      if (!this.game.inventoryHelper.canAddItemToBelt(player, srcItem)) return this.sendMessage(player, 'Your belt is full.');

      this.game.inventoryHelper.addItemToBelt(player, srcItem);
      this.game.characterHelper.setLeftHand(player, undefined);
      break;
    }

    case 'E': { // LtE
      if (!srcItem) return this.sendMessage(player, 'You aren\'t holding anything in that hand!');

      const equipSlot = this.getEquipmentSlot(player, srcItem);
      if (!equipSlot) return this.sendMessage(player, 'That item doesn\'t fit there.');

      if (player.items.equipment[equipSlot]) return this.sendMessage(player, 'You already have something equipped there!');

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

    case 'M': { // LtM
      if (!srcItem) return this.sendMessage(player, 'You aren\'t holding anything in that hand!');

      this.game.characterHelper.setLeftHand(player, undefined);
      this.game.inventoryHelper.sellItem(player, srcItem);

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

    if (!this.doPrelimChecks(player, srcItem, 'R', origSlot, dest, destSlot)) return;

    switch (dest) {
    case 'L': { // RtL
      const leftHand = player.items.equipment[ItemSlot.LeftHand];

      this.game.characterHelper.setLeftHand(player, srcItem);
      this.game.characterHelper.setRightHand(player, leftHand);
      break;
    }

    case 'S': { // RtS
      if (!srcItem) return this.sendMessage(player, 'You aren\'t holding anything in that hand!');
      if (!this.game.inventoryHelper.canAddItemToSack(player, srcItem)) return this.sendMessage(player, 'Your sack is full.');

      this.game.inventoryHelper.addItemToSack(player, srcItem);
      this.game.characterHelper.setRightHand(player, undefined);
      break;
    }

    case 'B': { // RtB
      if (!srcItem) return this.sendMessage(player, 'You aren\'t holding anything in that hand!');
      if (!this.game.inventoryHelper.canAddItemToBelt(player, srcItem)) return this.sendMessage(player, 'Your belt is full.');

      this.game.inventoryHelper.addItemToBelt(player, srcItem);
      this.game.characterHelper.setRightHand(player, undefined);
      break;
    }

    case 'E': { // RtE
      if (!srcItem) return this.sendMessage(player, 'You aren\'t holding anything in that hand!');

      const equipSlot = this.getEquipmentSlot(player, srcItem);
      if (!equipSlot) return this.sendMessage(player, 'That item doesn\'t fit there.');

      if (player.items.equipment[equipSlot]) return this.sendMessage(player, 'You already have something equipped there!');

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

    case 'M': { // RtM
      if (!srcItem) return this.sendMessage(player, 'You aren\'t holding anything in that hand!');

      this.game.characterHelper.setRightHand(player, undefined);
      this.game.inventoryHelper.sellItem(player, srcItem);

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
    if (!this.doPrelimChecks(player, srcItem, 'E', origSlot, dest, destSlot)) return;

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
      if (!this.game.inventoryHelper.canAddItemToSack(player, srcItem)) return this.sendMessage(player, 'Your sack is full.');

      this.game.inventoryHelper.addItemToSack(player, srcItem);
      this.game.characterHelper.setEquipmentSlot(player, origSlot as ItemSlot, undefined);
      break;
    }

    case 'B': { // EtB
      if (!this.game.inventoryHelper.canAddItemToBelt(player, srcItem)) return this.sendMessage(player, 'Your belt is full.');

      this.game.inventoryHelper.addItemToBelt(player, srcItem);
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

    if (!this.doPrelimChecks(player, srcItem, 'B', origSlot, dest, destSlot)) return;

    switch (dest) {
    case 'R': { // BtR
      const rightHand = player.items.equipment[ItemSlot.RightHand];
      const leftHand = player.items.equipment[ItemSlot.LeftHand];

      if (rightHand && leftHand) return this.sendMessage(player, 'Your hands are full.');

      if (rightHand && !leftHand) {
        const did = this.game.inventoryHelper.removeItemFromBelt(player, +origSlot);
        if (!did) return this.sendMessage(player, 'Could not take item from belt.');

        this.game.characterHelper.setLeftHand(player, rightHand);
        this.game.characterHelper.setRightHand(player, srcItem);

      } else if (!rightHand) {
        const did = this.game.inventoryHelper.removeItemFromBelt(player, +origSlot);
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
        const did = this.game.inventoryHelper.removeItemFromBelt(player, +origSlot);
        if (!did) return this.sendMessage(player, 'Could not take item from belt.');

        this.game.characterHelper.setRightHand(player, leftHand);
        this.game.characterHelper.setLeftHand(player, srcItem);

      } else if (!leftHand) {
        const did = this.game.inventoryHelper.removeItemFromBelt(player, +origSlot);
        if (!did) return this.sendMessage(player, 'Could not take item from belt.');

        this.game.characterHelper.setLeftHand(player, srcItem);
      }

      break;
    }

    case 'S': { // BtS
      if (!this.game.inventoryHelper.canAddItemToSack(player, srcItem)) return this.sendMessage(player, 'Your sack is full.');

      this.game.inventoryHelper.removeItemFromBelt(player, +origSlot);
      this.game.inventoryHelper.addItemToSack(player, srcItem);
      break;
    }

    case 'E': { // BtE
      const equipSlot = this.getEquipmentSlot(player, srcItem);
      if (!equipSlot) return this.sendMessage(player, 'That item doesn\'t fit there.');

      if (player.items.equipment[equipSlot]) return this.sendMessage(player, 'You already have something equipped there!');

      const did = this.game.inventoryHelper.removeItemFromBelt(player, +origSlot);
      if (!did) return this.sendMessage(player, 'Could not take item from belt.');

      this.game.characterHelper.setEquipmentSlot(player, equipSlot, srcItem);

      break;
    }

    case 'G': { // BtG
      const did = this.game.inventoryHelper.removeItemFromBelt(player, +origSlot);
      if (!did) return this.sendMessage(player, 'Could not take item from belt.');

      const { state } = this.game.worldManager.getMap(player.map);
      state.addItemToGround(player.x, player.y, srcItem);

      break;
    }

    case 'M': { // BtM
      const did = this.game.inventoryHelper.removeItemFromBelt(player, +origSlot);
      if (!did) return this.sendMessage(player, 'Could not take item from belt.');

      this.game.inventoryHelper.sellItem(player, srcItem);

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

    if (!this.doPrelimChecks(player, srcItem, 'S', origSlot, dest, destSlot)) return;

    switch (dest) {
    case 'R': { // StR
      const rightHand = player.items.equipment[ItemSlot.RightHand];
      const leftHand = player.items.equipment[ItemSlot.LeftHand];

      if (rightHand && leftHand) return this.sendMessage(player, 'Your hands are full.');

      if (rightHand && !leftHand) {
        const did = this.game.inventoryHelper.removeItemFromSack(player, +origSlot);
        if (!did) return this.sendMessage(player, 'Could not take item from sack.');

        this.game.characterHelper.setLeftHand(player, rightHand);
        this.game.characterHelper.setRightHand(player, srcItem);

      } else if (!rightHand) {
        const did = this.game.inventoryHelper.removeItemFromSack(player, +origSlot);
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
        const did = this.game.inventoryHelper.removeItemFromSack(player, +origSlot);
        if (!did) return this.sendMessage(player, 'Could not take item from sack.');

        this.game.characterHelper.setRightHand(player, leftHand);
        this.game.characterHelper.setLeftHand(player, srcItem);

      } else if (!leftHand) {
        const did = this.game.inventoryHelper.removeItemFromSack(player, +origSlot);
        if (!did) return this.sendMessage(player, 'Could not take item from sack.');

        this.game.characterHelper.setLeftHand(player, srcItem);
      }

      break;
    }

    case 'B': { // StB
      if (!this.game.inventoryHelper.canAddItemToBelt(player, srcItem)) return this.sendMessage(player, 'Your belt is full.');

      this.game.inventoryHelper.removeItemFromSack(player, +origSlot);
      this.game.inventoryHelper.addItemToBelt(player, srcItem);
      break;
    }

    case 'E': { // StE
      const equipSlot = this.getEquipmentSlot(player, srcItem);
      if (!equipSlot) return this.sendMessage(player, 'That item doesn\'t fit there.');

      if (player.items.equipment[equipSlot]) return this.sendMessage(player, 'You already have something equipped there!');

      const did = this.game.inventoryHelper.removeItemFromSack(player, +origSlot);
      if (!did) return this.sendMessage(player, 'Could not take item from sack.');

      this.game.characterHelper.setEquipmentSlot(player, equipSlot, srcItem);

      break;
    }

    case 'G': { // StG
      const did = this.game.inventoryHelper.removeItemFromSack(player, +origSlot);
      if (!did) return this.sendMessage(player, 'Could not take item from sack.');

      const { state } = this.game.worldManager.getMap(player.map);
      state.addItemToGround(player.x, player.y, srcItem);

      break;
    }

    case 'M': { // StM
      const did = this.game.inventoryHelper.removeItemFromSack(player, +origSlot);
      if (!did) return this.sendMessage(player, 'Could not take item from sack.');

      this.game.inventoryHelper.sellItem(player, srcItem);

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

    if (!this.doPrelimChecks(player, items[0].item, 'G', origSlot, dest, destSlot)) return;

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

      if (player.items.equipment[equipSlot]) return this.sendMessage(player, 'You already have something equipped there!');

      this.game.characterHelper.setEquipmentSlot(player, equipSlot, items[0].item);
      state.removeItemFromGround(player.x, player.y, itemClass as ItemClass, items[0].item.uuid, 1);

      break;
    }

    case 'S': { // GtS

      const spaceLeft = this.game.inventoryHelper.sackSpaceLeft(player);
      const addItems: ISimpleItem[] = [];
      const uuidRemoveCounts: Record<string, number> = {};

      items.forEach(item => {
        if (!this.doPrelimChecks(player, item.item, 'G', origSlot, dest, destSlot)) return;
        if (addItems.length >= spaceLeft) return;

        for (let i = 0; i < item.count; i++) {
          if (addItems.length >= spaceLeft) break;

          uuidRemoveCounts[item.item.uuid] = uuidRemoveCounts[item.item.uuid] || 0;
          uuidRemoveCounts[item.item.uuid]++;

          addItems.push(this.game.itemCreator.rerollItem(item.item));
        }
      });

      addItems.forEach(item => {
        if (!this.game.inventoryHelper.canAddItemToSack(player, item)) return this.sendMessage(player, 'Your sack is full.');
        this.game.inventoryHelper.addItemToSack(player, item);
      });

      Object.keys(uuidRemoveCounts).forEach(removeUUID => {
        state.removeItemFromGround(player.x, player.y, itemClass as ItemClass, removeUUID, uuidRemoveCounts[removeUUID]);
      });

      break;
    }

    case 'B': { // GtB

      const spaceLeft = this.game.inventoryHelper.beltSpaceLeft(player);
      const addItems: ISimpleItem[] = [];
      const uuidRemoveCounts: Record<string, number> = {};

      items.forEach(item => {
        if (!this.doPrelimChecks(player, item.item, 'G', origSlot, dest, destSlot)) return;
        if (addItems.length >= spaceLeft) return;

        for (let i = 0; i < item.count; i++) {
          if (addItems.length >= spaceLeft) break;

          uuidRemoveCounts[item.item.uuid] = uuidRemoveCounts[item.item.uuid] || 0;
          uuidRemoveCounts[item.item.uuid]++;

          addItems.push(this.game.itemCreator.rerollItem(item.item));
        }
      });

      addItems.forEach(item => {
        if (!this.game.inventoryHelper.canAddItemToBelt(player, item)) return this.sendMessage(player, 'Your belt is full.');
        this.game.inventoryHelper.addItemToBelt(player, item);
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

  // handle M as an origin
  handleM(player: IPlayer, dest: string, origSlot: string, destSlot: string) {
    if (!validDestinations.M.includes(dest)) return this.sendMessage(player, 'Invalid item move destination.');

    const [npcUUID, subtype, subslot] = origSlot.split(':');
    const npc: INPC = this.game.targettingHelper.getFirstPossibleTargetInViewRange(player, npcUUID) as INPC;

    if (!npc) {
      this.sendMessage(player, 'You do not see that person.');
      return;
    }

    if (this.game.directionHelper.distFrom(player, npc) > 2) {
      this.sendMessage(player, 'You are too far away from that person!');
      return;
    }

    const vendorBehavior: VendorBehavior = (npc.behaviors || []).find(b => (b as VendorBehavior).vendorItems) as VendorBehavior;
    if (!vendorBehavior) {
      this.sendMessage(player, 'That person is not a merchant!');
      return;
    }

    const vitems = subtype === 'v' ? vendorBehavior.vendorItems : vendorBehavior.vendorDailyItems;
    const item = vitems[+subslot];
    const cost = item.mods.value ?? 0;
    const isDaily = this.game.dailyHelper.isDailyItem(item);

    if (isDaily && !this.game.dailyHelper.canBuyDailyItem(player, item)) {
      this.sendMessage(player, `**${npc.name}**: Those are sold out for today, come back later!`);
      return;
    }

    if (!this.doPrelimChecks(player, item, 'M', origSlot, dest, destSlot)) return;

    switch (dest) {
    case 'R': { // MtR

      if (!this.game.currencyHelper.hasCurrency(player, cost, Currency.Gold)) {
        this.sendMessage(player, 'You do not have enough to buy that!');
        return false;
      }

      const createdItem = this.game.itemCreator.getSimpleItem(item.name);
      const rightHand = player.items.equipment[ItemSlot.RightHand];
      const leftHand = player.items.equipment[ItemSlot.LeftHand];

      if (rightHand && leftHand) return this.sendMessage(player, 'Your hands are full.');

      if (rightHand && !leftHand) {
        this.game.characterHelper.setLeftHand(player, rightHand);
        this.game.characterHelper.setRightHand(player, createdItem);

      } else if (!rightHand) {
        this.game.characterHelper.setRightHand(player, createdItem);
      }

      this.game.currencyHelper.loseCurrency(player, cost, Currency.Gold);

      break;
    }

    case 'L': { // MtL
      if (!this.game.currencyHelper.hasCurrency(player, cost, Currency.Gold)) {
        this.sendMessage(player, 'You do not have enough to buy that!');
        return;
      }

      const createdItem = this.game.itemCreator.getSimpleItem(item.name);
      const rightHand = player.items.equipment[ItemSlot.RightHand];
      const leftHand = player.items.equipment[ItemSlot.LeftHand];

      if (leftHand && rightHand) return this.sendMessage(player, 'Your hands are full.');

      if (leftHand && !rightHand) {
        this.game.characterHelper.setRightHand(player, rightHand);
        this.game.characterHelper.setLeftHand(player, createdItem);

      } else if (!leftHand) {
        this.game.characterHelper.setLeftHand(player, createdItem);
      }

      this.game.currencyHelper.loseCurrency(player, cost, Currency.Gold);

      break;
    }

    case 'B': { // MtL
      const maxItemsBuyable = isDaily ? 1 : Math.min(this.game.inventoryHelper.beltSpaceLeft(player), +destSlot);
      for (let i = 0; i < maxItemsBuyable; i++) {
        const createdItem = this.game.itemCreator.getSimpleItem(item.name);

        if (!this.game.currencyHelper.hasCurrency(player, cost, Currency.Gold)
          || !this.game.inventoryHelper.canAddItemToBelt(player, createdItem)) {
          return;
        }

        this.game.currencyHelper.loseCurrency(player, cost, Currency.Gold);
        this.game.inventoryHelper.addItemToBelt(player, createdItem);
      }

      break;
    }

    case 'S': { // MtL
      const maxItemsBuyable = isDaily ? 1 : Math.min(this.game.inventoryHelper.sackSpaceLeft(player), +destSlot);
      for (let i = 0; i < maxItemsBuyable; i++) {
        const createdItem = this.game.itemCreator.getSimpleItem(item.name);

        if (!this.game.currencyHelper.hasCurrency(player, cost, Currency.Gold)
          || !this.game.inventoryHelper.canAddItemToSack(player, createdItem)) {
          return;
        }

        this.game.currencyHelper.loseCurrency(player, cost, Currency.Gold);
        this.game.inventoryHelper.addItemToSack(player, createdItem);
      }

      break;
    }

    default: {
      this.game.logger.error('MoveItems', `handleM ${player.name} ${dest} ${origSlot} ${destSlot} went to default.`);
      return this.sendMessage(player, 'Something went wrong, please contact a GM.');
    }
    }

    if (isDaily) {
      this.game.dailyHelper.buyDailyItem(player, item);
    }
  }

  // handle O as an origin
  handleO(player: IPlayer, dest: string, origSlot: string, destSlot: string) {
    if (!validDestinations.O.includes(dest)) return this.sendMessage(player, 'Invalid item move destination.');

    const itemSlot = +origSlot.split(':')[1];
    const srcItem = player.items.buyback[itemSlot];

    if (!this.doPrelimChecks(player, srcItem, 'O', origSlot, dest, destSlot)) return;

    this.game.currencyHelper.loseCurrency(player, srcItem.mods.buybackValue ?? 0, Currency.Gold);

    switch (dest) {
    case 'R': { // OtR
      const rightHand = player.items.equipment[ItemSlot.RightHand];
      const leftHand = player.items.equipment[ItemSlot.LeftHand];

      if (rightHand && leftHand) return this.sendMessage(player, 'Your hands are full.');

      if (rightHand && !leftHand) {
        this.game.inventoryHelper.removeItemFromBuyback(player, itemSlot);
        this.game.characterHelper.setLeftHand(player, rightHand);
        this.game.characterHelper.setRightHand(player, srcItem);

      } else if (!rightHand) {
        this.game.inventoryHelper.removeItemFromBuyback(player, itemSlot);
        this.game.characterHelper.setRightHand(player, srcItem);
      }

      break;
    }

    case 'L': { // OtL
      const rightHand = player.items.equipment[ItemSlot.RightHand];
      const leftHand = player.items.equipment[ItemSlot.LeftHand];

      if (leftHand && rightHand) return this.sendMessage(player, 'Your hands are full.');

      if (leftHand && !rightHand) {
        this.game.inventoryHelper.removeItemFromBuyback(player, itemSlot);
        this.game.characterHelper.setRightHand(player, leftHand);
        this.game.characterHelper.setLeftHand(player, srcItem);

      } else if (!leftHand) {
        this.game.inventoryHelper.removeItemFromBuyback(player, itemSlot);
        this.game.characterHelper.setLeftHand(player, srcItem);
      }

      break;
    }

    case 'S': { // OtS
      if (!this.game.inventoryHelper.canAddItemToSack(player, srcItem)) return this.sendMessage(player, 'Your sack is full.');

      this.game.inventoryHelper.addItemToSack(player, srcItem);
      this.game.inventoryHelper.removeItemFromBuyback(player, itemSlot);
      break;
    }

    case 'B': { // OtB
      if (!this.game.inventoryHelper.canAddItemToBelt(player, srcItem)) return this.sendMessage(player, 'Your belt is full.');

      this.game.inventoryHelper.addItemToBelt(player, srcItem);
      this.game.inventoryHelper.removeItemFromBuyback(player, itemSlot);
      break;
    }

    default: {
      this.game.logger.error('MoveItems', `handleO ${player.name} ${dest} ${origSlot} ${destSlot} went to default.`);
      return this.sendMessage(player, 'Something went wrong, please contact a GM.');
    }
    }

  }

}
