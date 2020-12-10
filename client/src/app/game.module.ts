import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { UIModule } from './ui.module';

import { ButtonCloseComponent } from './_shared/components/button-close.component';
import { ButtonMinimizeComponent } from './_shared/components/button-minimize.component';
import { CharacterCardComponent } from './_shared/components/character-card.component';
import { EffectIconComponent } from './_shared/components/effect-icon.component';
import { IconComponent } from './_shared/components/icon.component';
import { InventoryComponent } from './_shared/components/inventory/inventory.component';
import { ItemComponent } from './_shared/components/item/item.component';
import { LifeHeartComponent } from './_shared/components/life-heart.component';
import { MacroComponent } from './_shared/components/macro/macro.component';
import { NPCComponent } from './_shared/components/npc/npc.component';
import { WindowComponent } from './_shared/components/window.component';
import { AboutComponent } from './_shared/modals/about/about.component';
import { AlertComponent } from './_shared/modals/alert/alert.component';

import { DraggableDirective } from './_shared/directives/dragdrop/draggable.directive';
import { DroppableDirective } from './_shared/directives/dragdrop/droppable.directive';
import { DraggableDirective as DraggableWindowDirective } from './_shared/directives/draggable-window.directive';

import { ConfirmModalComponent } from './_shared/modals/confirm/confirm.component';
import { DialogComponent } from './_shared/modals/dialog/dialog.component';

import { GoldifyPipe } from './_shared/pipes/goldify.pipe';
import { LinkifyPipe } from './_shared/pipes/linkify.pipe';

import { LoginComponent } from './login/login.component';
import { MenuComponent } from './menu/menu.component';

import { SkillIconComponent } from './_shared/components/skill-icon';
import { AccountComponent } from './_shared/modals/account/account.component';
import { AmountModalComponent } from './_shared/modals/amount/amount.component';
import { CurrentEventsComponent } from './_shared/modals/currentevents/currentevents.component';
import { MacroEditorComponent } from './_shared/modals/macroeditor/macroeditor.component';
import { ManageSilverComponent } from './_shared/modals/managesilver/managesilver.component';
import { NewSpellsComponent } from './_shared/modals/newspells/newspells.component';
import { OptionsComponent } from './_shared/modals/options/options.component';
import { TextModalComponent } from './_shared/modals/text/text.component';

import { ActiveTargetComponent } from './containers/game-container/active-target/active-target.component';
import { AdventureLogComponent } from './containers/game-container/adventure-log/adventure-log.component';
import { BankComponent } from './containers/game-container/bank/bank.component';
import { CharacterListComponent } from './containers/game-container/character-list/character-list.component';
import { CommandLineComponent } from './containers/game-container/command-line/command-line.component';
import { EquipmentMainComponent } from './containers/game-container/equipment-main/equipment-main.component';
import { GameContainerComponent } from './containers/game-container/game-container.component';
import { GroundComponent } from './containers/game-container/ground/ground.component';
import { InventoryBeltComponent } from './containers/game-container/inventory-belt/inventory-belt.component';
import { InventoryPouchComponent } from './containers/game-container/inventory-pouch/inventory-pouch.component';
import { InventorySackComponent } from './containers/game-container/inventory-sack/inventory-sack.component';
import { MacroBarComponent } from './containers/game-container/macro-bar/macro-bar.component';
import { MapComponent } from './containers/game-container/map/map.component';
import { PlayerStatusComponent } from './containers/game-container/player-status/player-status.component';
import { TrainerComponent } from './containers/game-container/trainer/trainer.component';
import { TraitsComponent } from './containers/game-container/traits/traits.component';
import { VendorComponent } from './containers/game-container/vendor/vendor.component';

import { CharCreateComponent } from './containers/lobby-container/char-create/char-create.component';
import { CharSelectComponent } from './containers/lobby-container/char-select/char-select.component';
import { LobbyContainerComponent } from './containers/lobby-container/lobby-container.component';
import { LobbyComponent } from './containers/lobby-container/lobby/lobby.component';

import { JournalComponent } from './journal/journal.component';

const declarations = [
  AlertComponent, DraggableWindowDirective, ButtonCloseComponent, ButtonMinimizeComponent, IconComponent,
  WindowComponent, GoldifyPipe, LinkifyPipe, EffectIconComponent, DialogComponent, NPCComponent,
  DraggableDirective, DroppableDirective, ConfirmModalComponent, AboutComponent, AccountComponent,
  ManageSilverComponent, CurrentEventsComponent, OptionsComponent, AmountModalComponent, MacroEditorComponent,
  TextModalComponent, NewSpellsComponent
];

const gameComponents = [
  LoginComponent,
  MenuComponent,
  GameContainerComponent,
  LobbyContainerComponent,
  LobbyComponent,
  CharSelectComponent,
  CharCreateComponent,
  MapComponent,
  CommandLineComponent,
  AdventureLogComponent,
  ActiveTargetComponent,
  MacroBarComponent,

  InventoryComponent,
  ItemComponent,
  CharacterCardComponent,
  LifeHeartComponent,
  SkillIconComponent,
  MacroComponent,

  InventoryBeltComponent,
  InventoryPouchComponent,
  InventorySackComponent,

  EquipmentMainComponent,
  PlayerStatusComponent,
  CharacterListComponent,
  GroundComponent,
  TrainerComponent,
  VendorComponent,
  BankComponent,
  TraitsComponent,

  JournalComponent
];


@NgModule({
  declarations: [...declarations, ...gameComponents],
  imports: [CommonModule, FormsModule, UIModule],
  exports: [...declarations, ...gameComponents]
})
export class GameModule { }
