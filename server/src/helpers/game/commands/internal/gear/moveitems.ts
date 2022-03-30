import { Currency, distanceFrom, EquipHash, IGroundItem, IMacroCommandArgs,
  INPC, IPlayer, ISimpleItem, ItemClass, ItemSlot, ObjectType } from '../../../../../interfaces';
import { MacroCommand } from '../../../../../models/macro';
import { VendorBehavior } from '../../../../../models/world/ai/behaviors';

const origins = [
  'R',  // right hand
  'L',  // left hand
  'E',  // equipment
  'B',  // belt
  'S',  // sack
  'D',  // demimagicpouch
  'C',  // coin
  'G',  // ground
  'M',  // merchant
  'O',  // obtainagain (buyback)
  'W',  // wardrobe (locker)
  'K',  // kollection (materials)
];

const validDestinations = {
  E: ['B', 'S', 'L', 'R', 'G', 'W', 'D'],
  B: ['L', 'R', 'S', 'E', 'G', 'M', 'W', 'D'],
  S: ['L', 'R', 'B', 'E', 'G', 'M', 'W', 'K', 'D'],
  L: ['R', 'E', 'B', 'S', 'G', 'M', 'W', 'K', 'D'],
  R: ['L', 'E', 'B', 'S', 'G', 'M', 'W', 'K', 'D'],
  C: ['R', 'L', 'G'],
  G: ['R', 'L', 'E', 'B', 'S', 'W', 'K', 'D'],
  M: ['R', 'L', 'B', 'S', 'D'],
  O: ['R', 'L', 'B', 'S', 'D'],
  W: ['R', 'L', 'B', 'S', 'E', 'G', 'D'],
  K: ['R', 'L', 'S', 'G', 'D'],
  D: ['R', 'L', 'S', 'B', 'G', 'E', 'W', 'M', 'K']
};

const allAliases = origins.map(o => validDestinations[o].map(sub => `${o}t${sub}`)).flat();

export class MoveItems extends MacroCommand {

  override aliases = allAliases;
  override canBeFast = true;
  override canBeInstant = true;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    const [o, d] = args.calledAlias.split(' ')[0].split('t');

    if (!this[`handle${o}`]) return this.sendMessage(player, 'Invalid item move origin.');

    this[`handle${o}`](player, d, ...args.arrayArgs);
    this.doPostChecks(player, o, d);
  }

  private doPostChecks(player: IPlayer, srcSlot: string, destSlot: string): void {
    const updatePlayerSlots =    { E: true, L: true, R: true };
    const updateGroundSlots =    { G: true };
    const updateEquipmentSlots = { R: true, L: true, E: true };

    const state = this.game.worldManager.getMap(player.map)?.state;
    if (!state) return;

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
        retVal = false;

      // if we have a succor in our hands already, drop it
      } else if (src === 'L' || src === 'R') {
        itemSlot = src === 'L' ? ItemSlot.LeftHand : ItemSlot.RightHand;
        retVal = false;
      }

      if (src === 'S') {
        this.game.inventoryHelper.removeItemsFromSackByUUID(player, [srcItem.uuid]);
      } else if (src === 'D') {
        this.game.inventoryHelper.removeItemsFromPouchByUUID(player, [srcItem.uuid]);
      }

      this.game.characterHelper.setEquipmentSlot(player, itemSlot, srcItem);
      this.game.itemHelper.useItemInSlot(player, itemSlot);
      return retVal;
    }

    // Dest: S - Items must be sackable
    if (dest === 'S' && !this.game.inventoryHelper.canAddItemToSack(player, srcItem)) {
      this.sendMessage(player, 'That item cannot fit in your sack.');
      return false;
    }

    // Dest: B - Items must be beltable
    if (dest === 'B' && !this.game.inventoryHelper.canAddItemToBelt(player, srcItem)) {
      this.sendMessage(player, 'That item cannot fit in your belt.');
      return false;
    }

    // Dest: E - Items must be able to be used by the equipper
    if (dest === 'E' && !this.game.itemHelper.canGetBenefitsFromItem(player, srcItem)) {
      this.sendMessage(player, this.game.itemHelper.reasonCantGetBenefitsFromItem(player, srcItem));
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

      if (distanceFrom(player, npc) > 2) {
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

      if (distanceFrom(player, npc) > 2) {
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

    // src or dest is Wardrobe = make sure we're standing on a locker
    if (dest === 'W' || src === 'W') {
      const locker = this.game.worldManager.getMap(player.map)?.map.getInteractableOfTypeAt(player.x, player.y, ObjectType.Locker);
      if (!locker) {
        this.sendMessage(player, 'You are not near a locker!');
        return false;
      }

      if (src === 'W') {
        if (!this.game.lockerHelper.hasLockerFromString(player, srcSlot)) return false;
      }

      if (dest === 'W') {
        if (!destSlot) return false;
        if (!this.game.lockerHelper.hasLockerFromString(player, destSlot)) return false;
        if (destSlot.includes('Shared') && !this.game.subscriptionHelper.hasSharedLocker(player)) {
          this.sendMessage(player, 'You do not have a shared wardrobe!');
          return false;
        }

        const lockerRef = this.game.lockerHelper.getLockerFromString(player, destSlot);
        const canAdd = this.game.inventoryHelper.canAddItemToLocker(player, srcItem, lockerRef);
        if (!canAdd) {
          this.sendMessage(player, 'That item cannot fit in your wardrobe!');
          return false;
        }
      }
    }

    if (dest === 'K' || src === 'K') {
      const locker = this.game.worldManager.getMap(player.map)?.map.getInteractableOfTypeAt(player.x, player.y, ObjectType.Locker);
      if (!locker) {
        this.sendMessage(player, 'You are not near a locker!');
        return false;
      }

      if (src === 'K') {
        const [k, item] = srcSlot.split(':');
        if (!this.game.inventoryHelper.canAddMaterial(player, item)) {
          this.sendMessage(player, 'That item is not a material!');
          return false;
        }
      }
    }

    if (dest === 'D') {
      if (!this.game.subscriptionHelper.hasPouch(player)) return false;

      if (srcItem.name.includes('Conjured') || succorInfo) {
        this.sendMessage(player, 'That item cannot fit in your pouch!');
        return false;
      }
    }

    if (src === 'G' && srcItem.mods.itemClass === ItemClass.TrapSet) {
      if (srcItem.mods.trapSetBy !== player.uuid) {
        this.sendMessage(player, 'That is not your trap!');
        return false;
      }

      delete srcItem.mods.itemClass;
      delete srcItem.mods.trapEffect;
      srcItem.mods.trapUses = 1;
    }

    return true;
  }

  private getEquipmentSlot(player: IPlayer, item: ISimpleItem): ItemSlot | null {
    const itemClass = this.game.itemHelper.getItemProperty(item, 'itemClass');
    const slot = EquipHash[itemClass];

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

    // wands can only be equipped if you have the trait to do it
    if (slot === ItemSlot.Ammo && itemClass === ItemClass.Wand && !this.game.traitHelper.hasLearnedTrait(player, 'MagicalStrikes')) {
      return null;
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
      const { state, x: dropX, y: dropY } = this.game.worldManager.getMapStateAndXYForCharacterItemDrop(player, player.x, player.y);
      state.addItemToGround(dropX, dropY, srcItem);

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

    case 'D': { // LtD
      if (!srcItem) return this.sendMessage(player, 'You aren\'t holding anything in that hand!');
      if (!this.game.inventoryHelper.canAddItemToPouch(player, srcItem)) return this.sendMessage(player, 'Your pouch is full.');

      this.game.inventoryHelper.addItemToPouch(player, srcItem);
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
      const { state, x: dropX, y: dropY } = this.game.worldManager.getMapStateAndXYForCharacterItemDrop(player, player.x, player.y);

      this.game.characterHelper.setLeftHand(player, undefined);
      state.addItemToGround(dropX, dropY, srcItem);

      break;
    }

    case 'M': { // LtM
      if (!srcItem) return this.sendMessage(player, 'You aren\'t holding anything in that hand!');
      if (!this.game.inventoryHelper.canSellItem(player, srcItem)) return this.sendMessage(player, 'The merchant won\'t accept that.');

      this.game.characterHelper.setLeftHand(player, undefined);
      this.game.inventoryHelper.sellItem(player, srcItem);

      break;
    }

    case 'W': { // LtW
      if (!srcItem) return this.sendMessage(player, 'You aren\'t holding anything in that hand!');

      this.game.inventoryHelper.addItemToLocker(player, srcItem, this.game.lockerHelper.getLockerFromString(player, destSlot));
      this.game.characterHelper.setLeftHand(player, undefined);
      break;
    }

    case 'K': { // LtK
      if (!srcItem) return this.sendMessage(player, 'You aren\'t holding anything in that hand!');

      const materialRef = this.game.lockerHelper.getMaterialRef(srcItem.name);
      if (!materialRef) return this.sendMessage(player, 'That is not a material!');

      const materialSpaceLeft = this.game.inventoryHelper.materialSpaceLeft(player, materialRef);
      if (materialSpaceLeft <= 0) return this.sendMessage(player, 'You have no more space for that material!');

      const { withdrawInOunces } = this.game.lockerHelper.getMaterialData(materialRef);
      if (withdrawInOunces) {
        const totalOz = this.game.itemHelper.getItemProperty(srcItem, 'ounces') ?? 1;
        const takeOz = Math.min(materialSpaceLeft, totalOz);

        srcItem.mods.ounces = totalOz - takeOz;
        this.game.inventoryHelper.addMaterial(player, materialRef, takeOz);

        if (srcItem.mods.ounces <= 0) {
          this.game.characterHelper.setLeftHand(player, undefined);
        }

      } else {
        this.game.inventoryHelper.addMaterial(player, materialRef, 1);
        this.game.characterHelper.setLeftHand(player, undefined);

      }

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

    case 'D': { // RtD
      if (!srcItem) return this.sendMessage(player, 'You aren\'t holding anything in that hand!');
      if (!this.game.inventoryHelper.canAddItemToPouch(player, srcItem)) return this.sendMessage(player, 'Your pouch is full.');

      this.game.inventoryHelper.addItemToPouch(player, srcItem);
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
      const { state, x: dropX, y: dropY } = this.game.worldManager.getMapStateAndXYForCharacterItemDrop(player, player.x, player.y);

      this.game.characterHelper.setRightHand(player, undefined);
      state.addItemToGround(dropX, dropY, srcItem);

      break;
    }

    case 'M': { // RtM
      if (!srcItem) return this.sendMessage(player, 'You aren\'t holding anything in that hand!');
      if (!this.game.inventoryHelper.canSellItem(player, srcItem)) return this.sendMessage(player, 'The merchant won\'t accept that.');

      this.game.characterHelper.setRightHand(player, undefined);
      this.game.inventoryHelper.sellItem(player, srcItem);

      break;
    }

    case 'W': { // RtW
      if (!srcItem) return this.sendMessage(player, 'You aren\'t holding anything in that hand!');

      this.game.inventoryHelper.addItemToLocker(player, srcItem, this.game.lockerHelper.getLockerFromString(player, destSlot));
      this.game.characterHelper.setRightHand(player, undefined);
      break;
    }

    case 'K': { // RtK
      if (!srcItem) return this.sendMessage(player, 'You aren\'t holding anything in that hand!');

      const materialRef = this.game.lockerHelper.getMaterialRef(srcItem.name);
      if (!materialRef) return this.sendMessage(player, 'That is not a material!');

      const materialSpaceLeft = this.game.inventoryHelper.materialSpaceLeft(player, materialRef);
      if (materialSpaceLeft <= 0) return this.sendMessage(player, 'You have no more space for that material!');

      const { withdrawInOunces } = this.game.lockerHelper.getMaterialData(materialRef);
      if (withdrawInOunces) {
        const totalOz = this.game.itemHelper.getItemProperty(srcItem, 'ounces') ?? 1;
        const takeOz = Math.min(materialSpaceLeft, totalOz);

        srcItem.mods.ounces = totalOz - takeOz;
        this.game.inventoryHelper.addMaterial(player, materialRef, takeOz);

        if (srcItem.mods.ounces <= 0) {
          this.game.characterHelper.setRightHand(player, undefined);
        }

      } else {
        if (materialSpaceLeft <= 0) return this.sendMessage(player, 'You have no more space for that item!');

        this.game.inventoryHelper.addMaterial(player, materialRef, 1);
        this.game.characterHelper.setRightHand(player, undefined);

      }

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

    case 'D': { // EtD
      if (!this.game.inventoryHelper.canAddItemToPouch(player, srcItem)) return this.sendMessage(player, 'Your pouch is full.');

      this.game.inventoryHelper.addItemToPouch(player, srcItem);
      this.game.characterHelper.setEquipmentSlot(player, origSlot as ItemSlot, undefined);
      break;
    }

    case 'B': { // EtB
      if (!this.game.inventoryHelper.canAddItemToBelt(player, srcItem)) return this.sendMessage(player, 'Your belt is full.');

      this.game.inventoryHelper.addItemToBelt(player, srcItem);
      this.game.characterHelper.setEquipmentSlot(player, origSlot as ItemSlot, undefined);
      break;
    }

    case 'W': { // EtW
      this.game.inventoryHelper.addItemToLocker(player, srcItem, this.game.lockerHelper.getLockerFromString(player, destSlot));
      this.game.characterHelper.setEquipmentSlot(player, origSlot as ItemSlot, undefined);
      break;
    }

    case 'G': { // EtG
      this.game.characterHelper.setEquipmentSlot(player, origSlot as ItemSlot, undefined);

      const { state, x: dropX, y: dropY } = this.game.worldManager.getMapStateAndXYForCharacterItemDrop(player, player.x, player.y);
      state.addItemToGround(dropX, dropY, srcItem);

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

    case 'D': { // BtD
      if (!this.game.inventoryHelper.canAddItemToPouch(player, srcItem)) return this.sendMessage(player, 'Your pouch is full.');

      this.game.inventoryHelper.removeItemFromBelt(player, +origSlot);
      this.game.inventoryHelper.addItemToPouch(player, srcItem);
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

      const { state, x: dropX, y: dropY } = this.game.worldManager.getMapStateAndXYForCharacterItemDrop(player, player.x, player.y);
      state.addItemToGround(dropX, dropY, srcItem);

      break;
    }

    case 'M': { // BtM
      if (!this.game.inventoryHelper.canSellItem(player, srcItem)) return this.sendMessage(player, 'The merchant won\'t accept that.');

      const did = this.game.inventoryHelper.removeItemFromBelt(player, +origSlot);
      if (!did) return this.sendMessage(player, 'Could not take item from belt.');

      this.game.inventoryHelper.sellItem(player, srcItem);

      break;
    }

    case 'W': { // BtW
      const did = this.game.inventoryHelper.removeItemFromBelt(player, +origSlot);
      if (!did) return this.sendMessage(player, 'Could not take item from belt.');

      this.game.inventoryHelper.addItemToLocker(player, srcItem, this.game.lockerHelper.getLockerFromString(player, destSlot));
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

    case 'D': { // StD
      if (!this.game.inventoryHelper.canAddItemToPouch(player, srcItem)) return this.sendMessage(player, 'Your pouch is full.');

      this.game.inventoryHelper.removeItemFromSack(player, +origSlot);
      this.game.inventoryHelper.addItemToPouch(player, srcItem);
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

      const { state, x: dropX, y: dropY } = this.game.worldManager.getMapStateAndXYForCharacterItemDrop(player, player.x, player.y);
      state.addItemToGround(dropX, dropY, srcItem);

      break;
    }

    case 'M': { // StM
      if (!this.game.inventoryHelper.canSellItem(player, srcItem)) return this.sendMessage(player, 'The merchant won\'t accept that.');

      const did = this.game.inventoryHelper.removeItemFromSack(player, +origSlot);
      if (!did) return this.sendMessage(player, 'Could not take item from sack.');

      this.game.inventoryHelper.sellItem(player, srcItem);

      break;
    }

    case 'W': { // StW
      const did = this.game.inventoryHelper.removeItemFromSack(player, +origSlot);
      if (!did) return this.sendMessage(player, 'Could not take item from sack.');

      this.game.inventoryHelper.addItemToLocker(player, srcItem, this.game.lockerHelper.getLockerFromString(player, destSlot));
      break;
    }

    case 'K': { // StK
      const materialRef = this.game.lockerHelper.getMaterialRef(srcItem.name);
      if (!materialRef) return this.sendMessage(player, 'That is not a material!');

      const materialSpaceLeft = this.game.inventoryHelper.materialSpaceLeft(player, materialRef);
      if (materialSpaceLeft <= 0) return this.sendMessage(player, 'You have no more space for that material!');

      const { withdrawInOunces } = this.game.lockerHelper.getMaterialData(materialRef);
      if (withdrawInOunces) {
        const totalOz = this.game.itemHelper.getItemProperty(srcItem, 'ounces') ?? 1;
        const takeOz = Math.min(materialSpaceLeft, totalOz);

        srcItem.mods.ounces = totalOz - takeOz;
        this.game.inventoryHelper.addMaterial(player, materialRef, takeOz);

        if (srcItem.mods.ounces <= 0) {
          this.game.inventoryHelper.removeItemFromSack(player, +origSlot);
        }

      } else {
        this.game.inventoryHelper.addMaterial(player, materialRef, 1);
        this.game.inventoryHelper.removeItemFromSack(player, +origSlot);

      }

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
    if (!validDestinations.G.includes(dest) || !origSlot) return this.sendMessage(player, 'Invalid item move destination.');

    const [itemClass, uuid] = origSlot.split(':');

    const state = this.game.worldManager.getMap(player.map)?.state;
    if (!state) return;

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
        const checkItemClass = this.game.itemHelper.getItemProperty(item.item, 'itemClass');
        if (!this.doPrelimChecks(player, item.item, 'G', origSlot, dest, destSlot)) return;
        if (checkItemClass !== ItemClass.Coin && addItems.length >= spaceLeft) return;

        for (let i = 0; i < item.count; i++) {
          if (checkItemClass !== ItemClass.Coin && addItems.length >= spaceLeft) break;

          uuidRemoveCounts[item.item.uuid] = uuidRemoveCounts[item.item.uuid] || 0;
          uuidRemoveCounts[item.item.uuid]++;

          addItems.push(this.game.itemCreator.rerollItem(item.item, false));
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

    case 'D': { // GtD

      const spaceLeft = this.game.inventoryHelper.pouchSpaceLeft(player);
      const addItems: ISimpleItem[] = [];
      const uuidRemoveCounts: Record<string, number> = {};

      items.forEach(item => {
        if (!this.doPrelimChecks(player, item.item, 'G', origSlot, dest, destSlot)) return;
        if (addItems.length >= spaceLeft) return;

        for (let i = 0; i < item.count; i++) {
          if (addItems.length >= spaceLeft) break;

          uuidRemoveCounts[item.item.uuid] = uuidRemoveCounts[item.item.uuid] || 0;
          uuidRemoveCounts[item.item.uuid]++;

          addItems.push(this.game.itemCreator.rerollItem(item.item, false));
        }
      });

      addItems.forEach(item => {
        if (!this.game.inventoryHelper.canAddItemToPouch(player, item)) return this.sendMessage(player, 'Your pouch is full.');
        this.game.inventoryHelper.addItemToPouch(player, item);
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

          addItems.push(this.game.itemCreator.rerollItem(item.item, false));
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

    case 'W': { // GtW

      const destLocker = this.game.lockerHelper.getLockerFromString(player, destSlot);
      const spaceLeft = this.game.inventoryHelper.lockerSpaceLeft(player, destLocker);

      const addItems: ISimpleItem[] = [];
      const uuidRemoveCounts: Record<string, number> = {};

      items.forEach(item => {
        if (!this.doPrelimChecks(player, item.item, 'G', origSlot, dest, destSlot)) return;
        if (addItems.length >= spaceLeft) return;

        for (let i = 0; i < item.count; i++) {
          if (addItems.length >= spaceLeft) break;

          uuidRemoveCounts[item.item.uuid] = uuidRemoveCounts[item.item.uuid] || 0;
          uuidRemoveCounts[item.item.uuid]++;

          addItems.push(this.game.itemCreator.rerollItem(item.item, false));
        }
      });

      addItems.forEach(item => {
        if (!this.game.inventoryHelper.canAddItemToLocker(player, item, destLocker)) return this.sendMessage(player, 'Your belt is full.');
        this.game.inventoryHelper.addItemToLocker(player, item, destLocker);
      });

      Object.keys(uuidRemoveCounts).forEach(removeUUID => {
        state.removeItemFromGround(player.x, player.y, itemClass as ItemClass, removeUUID, uuidRemoveCounts[removeUUID]);
      });

      break;
    }

    case 'K': { // GtK

      items.forEach(item => {

        const materialRef = this.game.lockerHelper.getMaterialRef(item.item.name);
        if (!materialRef) return this.sendMessage(player, 'That is not a material!');

        const materialSpaceLeft = this.game.inventoryHelper.materialSpaceLeft(player, materialRef);
        if (materialSpaceLeft < 0) return this.sendMessage(player, 'You have no more space for that material!');

        const { withdrawInOunces } = this.game.lockerHelper.getMaterialData(materialRef);
        if (withdrawInOunces) {
          const totalOz = this.game.itemHelper.getItemProperty(item.item, 'ounces') ?? 1;
          const takeOz = Math.min(materialSpaceLeft, totalOz);

          item.item.mods.ounces = totalOz - takeOz;
          this.game.inventoryHelper.addMaterial(player, materialRef, takeOz);

          if (item.item.mods.ounces <= 0) {
            state.removeItemFromGround(player.x, player.y, itemClass as ItemClass, item.item.uuid, 1);
          }

        } else {
          const totalPossible = Math.min(materialSpaceLeft, item.count);

          this.game.inventoryHelper.addMaterial(player, materialRef, totalPossible);
          state.removeItemFromGround(player.x, player.y, itemClass as ItemClass, item.item.uuid, totalPossible);

        }
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
    if (!validDestinations.M.includes(dest) || !origSlot) return this.sendMessage(player, 'Invalid item move destination.');

    const [npcUUID, subtype, subslot] = origSlot.split(':');
    const npc: INPC = this.game.targettingHelper.getFirstPossibleTargetInViewRange(player, npcUUID) as INPC;

    if (!npc) {
      this.sendMessage(player, 'You do not see that person.');
      return;
    }

    if (distanceFrom(player, npc) > 2) {
      this.sendMessage(player, 'You are too far away from that person!');
      return;
    }

    const vendorBehavior: VendorBehavior = (npc.behaviors || []).find(b => (b as VendorBehavior).vendorItems) as VendorBehavior;
    if (!vendorBehavior) {
      this.sendMessage(player, 'That person is not a merchant!');
      return;
    }

    const currency = vendorBehavior.vendorCurrency;

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

      if (!this.game.currencyHelper.hasCurrency(player, cost, currency)) {
        this.sendMessage(player, 'You do not have enough to buy that!');
        return false;
      }

      const createdItem = this.game.itemCreator.getSimpleItem(item.name);
      createdItem.mods.sellValue = cost;

      const rightHand = player.items.equipment[ItemSlot.RightHand];
      const leftHand = player.items.equipment[ItemSlot.LeftHand];

      if (rightHand && leftHand) return this.sendMessage(player, 'Your hands are full.');

      if (rightHand && !leftHand) {
        this.game.characterHelper.setLeftHand(player, rightHand);
        this.game.characterHelper.setRightHand(player, createdItem);

      } else if (!rightHand) {
        this.game.characterHelper.setRightHand(player, createdItem);
      }

      this.game.currencyHelper.loseCurrency(player, cost, currency);

      break;
    }

    case 'L': { // MtL
      if (!this.game.currencyHelper.hasCurrency(player, cost, currency)) {
        this.sendMessage(player, 'You do not have enough to buy that!');
        return;
      }

      const createdItem = this.game.itemCreator.getSimpleItem(item.name);
      createdItem.mods.sellValue = cost;

      const rightHand = player.items.equipment[ItemSlot.RightHand];
      const leftHand = player.items.equipment[ItemSlot.LeftHand];

      if (leftHand && rightHand) return this.sendMessage(player, 'Your hands are full.');

      if (leftHand && !rightHand) {
        this.game.characterHelper.setRightHand(player, rightHand);
        this.game.characterHelper.setLeftHand(player, createdItem);

      } else if (!leftHand) {
        this.game.characterHelper.setLeftHand(player, createdItem);
      }

      this.game.currencyHelper.loseCurrency(player, cost, currency);

      break;
    }

    case 'B': { // MtB
      const maxItemsBuyable = isDaily ? 1 : Math.min(this.game.inventoryHelper.beltSpaceLeft(player), +destSlot);
      for (let i = 0; i < maxItemsBuyable; i++) {
        const createdItem = this.game.itemCreator.getSimpleItem(item.name);
        createdItem.mods.sellValue = cost;

        if (!this.game.currencyHelper.hasCurrency(player, cost, currency)
          || !this.game.inventoryHelper.canAddItemToBelt(player, createdItem)) {
          return;
        }

        this.game.currencyHelper.loseCurrency(player, cost, currency);
        this.game.inventoryHelper.addItemToBelt(player, createdItem);
      }

      break;
    }

    case 'S': { // MtS
      const maxItemsBuyable = isDaily ? 1 : Math.min(this.game.inventoryHelper.sackSpaceLeft(player), +destSlot);
      for (let i = 0; i < maxItemsBuyable; i++) {
        const createdItem = this.game.itemCreator.getSimpleItem(item.name);
        createdItem.mods.sellValue = cost;

        if (!this.game.currencyHelper.hasCurrency(player, cost, currency)
          || !this.game.inventoryHelper.canAddItemToSack(player, createdItem)) {
          return;
        }

        this.game.currencyHelper.loseCurrency(player, cost, currency);
        this.game.inventoryHelper.addItemToSack(player, createdItem);
      }

      break;
    }

    case 'D': { // MtD
      const maxItemsBuyable = isDaily ? 1 : Math.min(this.game.inventoryHelper.pouchSpaceLeft(player), +destSlot);
      for (let i = 0; i < maxItemsBuyable; i++) {
        const createdItem = this.game.itemCreator.getSimpleItem(item.name);
        createdItem.mods.sellValue = cost;

        if (!this.game.currencyHelper.hasCurrency(player, cost, currency)
          || !this.game.inventoryHelper.canAddItemToPouch(player, createdItem)) {
          return;
        }

        this.game.currencyHelper.loseCurrency(player, cost, currency);
        this.game.inventoryHelper.addItemToPouch(player, createdItem);
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
    if (!validDestinations.O.includes(dest) || !origSlot) return this.sendMessage(player, 'Invalid item move destination.');

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

    case 'D': { // OtD
      if (!this.game.inventoryHelper.canAddItemToPouch(player, srcItem)) return this.sendMessage(player, 'Your pouch is full.');

      this.game.inventoryHelper.addItemToPouch(player, srcItem);
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

  // handle W as an origin
  handleW(player: IPlayer, dest: string, origSlot: string, destSlot: string) {
    if (!validDestinations.W.includes(dest) || !origSlot) return this.sendMessage(player, 'Invalid item move destination.');

    const origLocker = this.game.lockerHelper.getLockerFromString(player, origSlot);
    const [w, locker, origLockerSlot] = origSlot.split(':');
    const srcItem = origLocker.items[+origLockerSlot];
    if (!this.doPrelimChecks(player, srcItem, 'W', origSlot, dest, destSlot)) return;

    switch (dest) {
    case 'R': { // WtR
      const didTake = this.game.inventoryHelper.removeItemFromLocker(player, +origLockerSlot, origLocker);
      if (!didTake) return this.sendMessage(player, 'Could not take item from locker.');

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

    case 'L': { // WtL
      const didTake = this.game.inventoryHelper.removeItemFromLocker(player, +origLockerSlot, origLocker);
      if (!didTake) return this.sendMessage(player, 'Could not take item from locker.');

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

    case 'G': { // WtG

      const didTake = this.game.inventoryHelper.removeItemFromLocker(player, +origLockerSlot, origLocker);
      if (!didTake) return this.sendMessage(player, 'Could not take item from locker.');

      const { state, x: dropX, y: dropY } = this.game.worldManager.getMapStateAndXYForCharacterItemDrop(player, player.x, player.y);
      state.addItemToGround(dropX, dropY, srcItem);

      break;
    }

    case 'B': { // WtB
      if (!this.game.inventoryHelper.canAddItemToBelt(player, srcItem)) return this.sendMessage(player, 'Your belt is full.');

      const didTake = this.game.inventoryHelper.removeItemFromLocker(player, +origLockerSlot, origLocker);
      if (!didTake) return this.sendMessage(player, 'Could not take item from locker.');

      this.game.inventoryHelper.addItemToBelt(player, srcItem);

      break;
    }

    case 'S': { // WtS
      if (!this.game.inventoryHelper.canAddItemToSack(player, srcItem)) return this.sendMessage(player, 'Your sack is full.');

      const didTake = this.game.inventoryHelper.removeItemFromLocker(player, +origLockerSlot, origLocker);
      if (!didTake) return this.sendMessage(player, 'Could not take item from locker.');

      this.game.inventoryHelper.addItemToSack(player, srcItem);

      break;
    }

    case 'D': { // WtD
      if (!this.game.inventoryHelper.canAddItemToPouch(player, srcItem)) return this.sendMessage(player, 'Your pouch is full.');

      const didTake = this.game.inventoryHelper.removeItemFromLocker(player, +origLockerSlot, origLocker);
      if (!didTake) return this.sendMessage(player, 'Could not take item from locker.');

      this.game.inventoryHelper.addItemToPouch(player, srcItem);

      break;
    }

    case 'E': { // WtE
      const equipSlot = this.getEquipmentSlot(player, srcItem);
      if (!equipSlot) return this.sendMessage(player, 'That item doesn\'t fit there.');

      if (player.items.equipment[equipSlot]) return this.sendMessage(player, 'You already have something equipped there!');

      const didTake = this.game.inventoryHelper.removeItemFromLocker(player, +origLockerSlot, origLocker);
      if (!didTake) return this.sendMessage(player, 'Could not take item from locker.');

      this.game.characterHelper.setEquipmentSlot(player, equipSlot, srcItem);

      break;
    }

    default: {
      this.game.logger.error('MoveItems', `handleW ${player.name} ${dest} ${origSlot} ${destSlot} went to default.`);
      return this.sendMessage(player, 'Something went wrong, please contact a GM.');
    }
    }

  }

  // handle K as an origin
  handleK(player: IPlayer, dest: string, origSlot: string, destSlot: string) {
    if (!validDestinations.K.includes(dest) || !origSlot) return this.sendMessage(player, 'Invalid item move destination.');

    const [k, source] = origSlot.split(':');
    const { items, withdrawInOunces } = this.game.lockerHelper.getMaterialData(source);

    const numTaken = withdrawInOunces ? this.game.userInputHelper.cleanNumber(destSlot, 0, { floor: true }) : 1;
    const totalTakeable = player.accountLockers.materials[source] ?? 0;

    const totalToTake = Math.min(numTaken, totalTakeable);
    if (totalToTake === 0) return this.sendMessage(player, 'You cannot take that many items!');

    const srcItem = this.game.itemCreator.getSimpleItem(items[0]);
    if (withdrawInOunces) {
      srcItem.mods.ounces = totalToTake;
    }

    this.game.inventoryHelper.removeMaterial(player, source, totalToTake);

    switch (dest) {
    case 'R': { // KtR
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

    case 'L': { // KtL
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

    case 'G': { // KtG
      const { state, x: dropX, y: dropY } = this.game.worldManager.getMapStateAndXYForCharacterItemDrop(player, player.x, player.y);
      state.addItemToGround(dropX, dropY, srcItem);

      break;
    }

    case 'S': { // KtS
      if (!this.game.inventoryHelper.canAddItemToSack(player, srcItem)) return this.sendMessage(player, 'Your sack is full.');

      this.game.inventoryHelper.addItemToSack(player, srcItem);
      break;
    }

    case 'S': { // KtS
      if (!this.game.inventoryHelper.canAddItemToPouch(player, srcItem)) return this.sendMessage(player, 'Your pouch is full.');

      this.game.inventoryHelper.addItemToPouch(player, srcItem);
      break;
    }

    default: {
      this.game.logger.error('MoveItems', `handleK ${player.name} ${dest} ${origSlot} ${destSlot} went to default.`);
      return this.sendMessage(player, 'Something went wrong, please contact a GM.');
    }
    }

  }

  // handle D as an origin
  handleD(player: IPlayer, dest: string, origSlot: string, destSlot: string) {
    if (!validDestinations.D.includes(dest)) return this.sendMessage(player, 'Invalid item move destination.');

    const srcItem = player.accountLockers.pouch.items[+origSlot];

    if (!srcItem) return this.sendMessage(player, 'You don\'t have an item there!');

    if (!this.doPrelimChecks(player, srcItem, 'D', origSlot, dest, destSlot)) return;

    switch (dest) {
    case 'R': { // DtR
      const rightHand = player.items.equipment[ItemSlot.RightHand];
      const leftHand = player.items.equipment[ItemSlot.LeftHand];

      if (rightHand && leftHand) return this.sendMessage(player, 'Your hands are full.');

      if (rightHand && !leftHand) {
        const did = this.game.inventoryHelper.removeItemFromPouch(player, +origSlot);
        if (!did) return this.sendMessage(player, 'Could not take item from sack.');

        this.game.characterHelper.setLeftHand(player, rightHand);
        this.game.characterHelper.setRightHand(player, srcItem);

      } else if (!rightHand) {
        const did = this.game.inventoryHelper.removeItemFromPouch(player, +origSlot);
        if (!did) return this.sendMessage(player, 'Could not take item from sack.');

        this.game.characterHelper.setRightHand(player, srcItem);
      }

      break;
    }

    case 'L': { // DtL
      const rightHand = player.items.equipment[ItemSlot.RightHand];
      const leftHand = player.items.equipment[ItemSlot.LeftHand];

      if (leftHand && rightHand) return this.sendMessage(player, 'Your hands are full.');

      if (leftHand && !rightHand) {
        const did = this.game.inventoryHelper.removeItemFromPouch(player, +origSlot);
        if (!did) return this.sendMessage(player, 'Could not take item from sack.');

        this.game.characterHelper.setRightHand(player, leftHand);
        this.game.characterHelper.setLeftHand(player, srcItem);

      } else if (!leftHand) {
        const did = this.game.inventoryHelper.removeItemFromPouch(player, +origSlot);
        if (!did) return this.sendMessage(player, 'Could not take item from sack.');

        this.game.characterHelper.setLeftHand(player, srcItem);
      }

      break;
    }

    case 'B': { // DtB
      if (!this.game.inventoryHelper.canAddItemToBelt(player, srcItem)) return this.sendMessage(player, 'Your belt is full.');

      this.game.inventoryHelper.removeItemFromPouch(player, +origSlot);
      this.game.inventoryHelper.addItemToBelt(player, srcItem);
      break;
    }

    case 'S': { // DtS
      if (!this.game.inventoryHelper.canAddItemToSack(player, srcItem)) return this.sendMessage(player, 'Your sack is full.');

      this.game.inventoryHelper.removeItemFromPouch(player, +origSlot);
      this.game.inventoryHelper.addItemToSack(player, srcItem);
      break;
    }

    case 'E': { // DtE
      const equipSlot = this.getEquipmentSlot(player, srcItem);
      if (!equipSlot) return this.sendMessage(player, 'That item doesn\'t fit there.');

      if (player.items.equipment[equipSlot]) return this.sendMessage(player, 'You already have something equipped there!');

      const did = this.game.inventoryHelper.removeItemFromPouch(player, +origSlot);
      if (!did) return this.sendMessage(player, 'Could not take item from sack.');

      this.game.characterHelper.setEquipmentSlot(player, equipSlot, srcItem);

      break;
    }

    case 'G': { // DtG
      const did = this.game.inventoryHelper.removeItemFromPouch(player, +origSlot);
      if (!did) return this.sendMessage(player, 'Could not take item from sack.');

      const { state, x: dropX, y: dropY } = this.game.worldManager.getMapStateAndXYForCharacterItemDrop(player, player.x, player.y);
      state.addItemToGround(dropX, dropY, srcItem);
      break;
    }

    case 'M': { // DtM
      if (!this.game.inventoryHelper.canSellItem(player, srcItem)) return this.sendMessage(player, 'The merchant won\'t accept that.');

      const did = this.game.inventoryHelper.removeItemFromPouch(player, +origSlot);
      if (!did) return this.sendMessage(player, 'Could not take item from sack.');

      this.game.inventoryHelper.sellItem(player, srcItem);

      break;
    }

    case 'W': { // DtW
      const did = this.game.inventoryHelper.removeItemFromPouch(player, +origSlot);
      if (!did) return this.sendMessage(player, 'Could not take item from sack.');

      this.game.inventoryHelper.addItemToLocker(player, srcItem, this.game.lockerHelper.getLockerFromString(player, destSlot));
      break;
    }

    case 'K': { // DtK
      const materialRef = this.game.lockerHelper.getMaterialRef(srcItem.name);
      if (!materialRef) return this.sendMessage(player, 'That is not a material!');

      const materialSpaceLeft = this.game.inventoryHelper.materialSpaceLeft(player, materialRef);
      if (materialSpaceLeft <= 0) return this.sendMessage(player, 'You have no more space for that material!');

      const { withdrawInOunces } = this.game.lockerHelper.getMaterialData(materialRef);
      if (withdrawInOunces) {
        const totalOz = this.game.itemHelper.getItemProperty(srcItem, 'ounces') ?? 1;
        const takeOz = Math.min(materialSpaceLeft, totalOz);

        srcItem.mods.ounces = totalOz - takeOz;
        this.game.inventoryHelper.addMaterial(player, materialRef, takeOz);

        if (srcItem.mods.ounces <= 0) {
          this.game.inventoryHelper.removeItemFromPouch(player, +origSlot);
        }

      } else {
        this.game.inventoryHelper.addMaterial(player, materialRef, 1);
        this.game.inventoryHelper.removeItemFromPouch(player, +origSlot);

      }

      break;
    }

    default: {
      this.game.logger.error('MoveItems', `handleD ${player.name} ${dest} ${origSlot} ${destSlot} went to default.`);
      return this.sendMessage(player, 'Something went wrong, please contact a GM.');
    }
    }
  }

}
