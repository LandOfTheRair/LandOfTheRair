import { Injectable } from '@angular/core';
import { GameService } from './game.service';

@Injectable({
  providedIn: 'root'
})
export class UIService {

  constructor(private gameService: GameService) {}

  public buildAndDoDropAction(event, droppedOn) {
    this.doDropAction(event.dragData, droppedOn);
  }

  private canMoveBetweenContainers(context: string, choice: string): boolean {
    if (context === choice && context !== 'T') return false;
    return true;
  }

  private doDropAction(dragData, dropScope) {
    console.log(dragData, dropScope);
    // also has { containerUUID, isStackableMaterial }
    const { context, contextSlot, item } = dragData;

    if (!context) return;

    const contextStr = context.substring(0, 1).toUpperCase();
    const choiceStr = dropScope.substring(0, 1).toUpperCase();
    const cmd = `!${contextStr}t${choiceStr}`;

    if (!this.canMoveBetweenContainers(contextStr, choiceStr)) return;

    let ctxArgs = '';
    const destArgs = '';

    if (context === 'Ground') {
      ctxArgs = `${item.itemClass}:${item.uuid}`;

    } else if (['Right', 'Left'].includes(context)) {
      ctxArgs = '_';

    } else if (context === 'GroundGroup') {
      ctxArgs = `${item.itemClass}`;

    } else if (['Sack', 'Belt', 'Equipment', 'DemiMagicPouch'].includes(context)) {
      ctxArgs = `${contextSlot}`;

    } else if (context === 'Coin') {

    } else if (context === 'Merchant') {

    }

    if (dropScope === 'use') {
      this.gameService.sendCommandString(`!use ${context.toLowerCase()} ${ctxArgs}`);
      return;
    }

    this.gameService.sendCommandString(cmd.trim() + ' ' + ctxArgs.trim() + ' ' + destArgs.trim());
  }
}
