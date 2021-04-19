import { Injectable } from '@angular/core';
import { GameService } from './game.service';
import { ModalService } from './modal.service';

@Injectable({
  providedIn: 'root'
})
export class UIService {

  private anySelected = 0;
  public selected = {
    sack: [],
    belt: [],
    equipment: {}
  };

  constructor(
    private modalService: ModalService,
    private gameService: GameService
  ) {}

  // reset selection
  public resetSelection() {
    this.selected.sack = [];
    this.selected.belt = [];
    this.selected.equipment = {};
    this.anySelected = 0;
  }

  public isSelected(container: string, slot: number|string): boolean {
    return !!this.selected[container.toLowerCase()]?.[slot];
  }

  // toggle selection of a particular item
  public select(container: string, slot: number|string, data: any) {
    if (this.selected[container][slot]) {
      delete this.selected[container][slot];
      this.anySelected--;
      return;
    }

    this.selected[container][slot] = data;
    this.anySelected++;
  }

  // build and do a drop on a spot. if any selections, we handle all of them
  public buildAndDoDropAction(event, droppedOn, dropUUID?: string) {

    // if we have selections, we gotta do all of them
    if (this.anySelected > 0) {

      for (let i = this.selected.sack.length; i > 0; i--) {
        const dragData = this.selected.sack[i];
        if (!dragData) continue;

        this.doDropAction(dragData, droppedOn, dropUUID);
      }

      for (let i = this.selected.belt.length; i > 0; i--) {
        const dragData = this.selected.belt[i];
        if (!dragData) continue;

        this.doDropAction(dragData, droppedOn, dropUUID);
      }

      Object.values(this.selected.equipment).forEach(dragData => {
        this.doDropAction(dragData, droppedOn, dropUUID);
      });

    // if no selections, do a normal drop
    } else {
      this.doDropAction(event.dragData, droppedOn, dropUUID);
    }

    this.resetSelection();
  }

  private canMoveBetweenContainers(context: string, choice: string): boolean {
    if (context === choice && context !== 'T') return false;
    return true;
  }

  public doDropAction(dragData, dropScope: string, dropUUID?: string) {
    // also has { containerUUID }
    const { context, contextSlot, item, realItem, isStackableMaterial } = dragData;

    if (!context) return;

    const contextStr = context.substring(0, 1).toUpperCase();
    const choiceStr = dropScope.substring(0, 1).toUpperCase();
    const cmd = `!${contextStr}t${choiceStr}`;

    const blacklistedCommands = ['!CtS'];
    if (blacklistedCommands.includes(cmd)) return;
    if (!this.canMoveBetweenContainers(contextStr, choiceStr)) return;

    let ctxArgs = '';

    console.log(item, realItem, dragData);

    // context arg parsing
    if (context === 'Ground') {
      ctxArgs = `${item.mods.itemClass ?? realItem.itemClass}:${item.uuid}`;

    } else if (['Right', 'Left'].includes(context)) {
      ctxArgs = '_';

    } else if (context === 'GroundGroup') {
      ctxArgs = `${item.mods.itemClass ?? realItem.itemClass}`;

    } else if (['Sack', 'Belt', 'Equipment', 'DemiMagicPouch', 'Obtainagain'].includes(context)) {
      ctxArgs = `${contextSlot}`;

    } else if (context === 'Coin') {
      const amount = this.modalService.amount(
        'Take Coins From Stash',
        'How many coins do you want to take from your stash?',
        dragData.item.mods.value
      );

      amount.subscribe((amt) => {
        this.gameService.sendCommandString(`${cmd} ${amt}`);
      });

      return;

    } else if (context === 'Merchant') {

      // buy to sack or belt we get a qty prompt
      if (choiceStr === 'S' || choiceStr === 'B') {
        const amount = this.modalService.amount(
          'Buy Items',
          'How many do you want to buy?',
          50
        );

        amount.subscribe((amt) => {
          this.gameService.sendCommandString(`${cmd} ${contextSlot} ${amt}`);
        });

      // otherwise we buy 1
      } else {
        this.gameService.sendCommandString(`${cmd} ${contextSlot} 1`);

      }

      return;

    } else if (context.includes('Wardrobe')) {
      ctxArgs = `${context}:${contextSlot}`;

    } else if (context.includes('Kollection')) {
      ctxArgs = `${context}:${contextSlot}`;

      if (isStackableMaterial) {
        const amount = this.modalService.amount(
          'Take Materials',
          'How many of this material do you want to take from your stash?',
          1000
        );

        amount.subscribe((amt) => {
          this.gameService.sendCommandString(`${cmd} ${ctxArgs} ${amt}`);
        });

        return;
      }

    }

    let destArgs = dropUUID || '';

    // dest arg parsing
    if (dropScope.includes('Wardrobe')) {
      destArgs = dropScope;
    }

    if (dropScope === 'use') {
      this.gameService.sendCommandString(`!use ${context.toLowerCase()} ${ctxArgs}`);
      return;
    }

    this.gameService.queueAction(cmd.trim(), (ctxArgs.trim() + ' ' + destArgs.trim()).trim());
  }
}
