import { Injectable } from '@angular/core';
import { GameService } from './game.service';
import { ModalService } from './modal.service';

@Injectable({
  providedIn: 'root'
})
export class UIService {

  constructor(private modalService: ModalService, private gameService: GameService) {}

  public buildAndDoDropAction(event, droppedOn, dropUUID?: string) {
    this.doDropAction(event.dragData, droppedOn, dropUUID);
  }

  private canMoveBetweenContainers(context: string, choice: string): boolean {
    if (context === choice && context !== 'T') return false;
    return true;
  }

  public doDropAction(dragData, dropScope, dropUUID?: string) {
    // also has { containerUUID, isStackableMaterial }
    const { context, contextSlot, item, realItem } = dragData;

    if (!context) return;

    const contextStr = context.substring(0, 1).toUpperCase();
    const choiceStr = dropScope.substring(0, 1).toUpperCase();
    const cmd = `!${contextStr}t${choiceStr}`;

    const blacklistedCommands = ['!CtS'];
    if (blacklistedCommands.includes(cmd)) return;
    if (!this.canMoveBetweenContainers(contextStr, choiceStr)) return;

    let ctxArgs = '';
    const destArgs = dropUUID || '';

    if (context === 'Ground') {
      ctxArgs = `${realItem.itemClass}:${item.uuid}`;

    } else if (['Right', 'Left'].includes(context)) {
      ctxArgs = '_';

    } else if (context === 'GroundGroup') {
      ctxArgs = `${realItem.itemClass}`;

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
    }

    if (dropScope === 'use') {
      this.gameService.sendCommandString(`!use ${context.toLowerCase()} ${ctxArgs}`);
      return;
    }

    this.gameService.sendCommandString(cmd.trim() + ' ' + ctxArgs.trim() + ' ' + destArgs.trim());
  }
}
