import { HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, ErrorHandler, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';

import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';
import { NgxsStoragePluginModule } from '@ngxs/storage-plugin';
import { getActionTypeFromInstance, NgxsModule } from '@ngxs/store';
import { NgxsResetPluginModule } from 'ngxs-reset-plugin';

import { environment } from '../environments/environment';
import * as AllStores from '../stores';
import { AppComponent } from './app.component';
import { AssetService } from './asset.service';
import { GameService } from './game.service';
import { LoginComponent } from './login/login.component';
import { MenuComponent } from './menu/menu.component';
import { SharedModule } from './shared.module';
import { SocketService } from './socket.service';

import { AlertErrorHandler } from './logger.service';

import { InventoryComponent } from './_shared/components/inventory/inventory.component';
import { ItemComponent } from './_shared/components/item/item.component';
import { ActiveTargetComponent } from './containers/game-container/active-target/active-target.component';
import { AdventureLogComponent } from './containers/game-container/adventure-log/adventure-log.component';
import { CommandLineComponent } from './containers/game-container/command-line/command-line.component';
import { EquipmentMainComponent } from './containers/game-container/equipment-main/equipment-main.component';
import { GameContainerComponent } from './containers/game-container/game-container.component';
import { InventoryBeltComponent } from './containers/game-container/inventory-belt/inventory-belt.component';
import { InventoryPouchComponent } from './containers/game-container/inventory-pouch/inventory-pouch.component';
import { InventorySackComponent } from './containers/game-container/inventory-sack/inventory-sack.component';
import { MapComponent } from './containers/game-container/map/map.component';
import { PlayerStatusComponent } from './containers/game-container/player-status/player-status.component';
import { CharCreateComponent } from './containers/lobby-container/char-create/char-create.component';
import { CharSelectComponent } from './containers/lobby-container/char-select/char-select.component';
import { LobbyContainerComponent } from './containers/lobby-container/lobby-container.component';
import { LobbyComponent } from './containers/lobby-container/lobby/lobby.component';
import { OptionsContainerComponent } from './containers/options-container/options-container.component';

import { SetActiveWindow, UpdateWindowPosition } from '../stores';
import { CharacterCardComponent } from './_shared/components/character-card.component';
import { LifeHeartComponent } from './_shared/components/life-heart.component';
import { MacroComponent } from './_shared/components/macro/macro.component';
import { CharacterListComponent } from './containers/game-container/character-list/character-list.component';
import { MacroBarComponent } from './containers/game-container/macro-bar/macro-bar.component';
import { MacrosService } from './macros.service';

const allActualStores = Object.keys(AllStores).filter(x => x.endsWith('State')).map(x => AllStores[x]);

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    MenuComponent,
    GameContainerComponent,
    LobbyContainerComponent,
    OptionsContainerComponent,
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
    MacroComponent,

    InventoryBeltComponent,
    InventoryPouchComponent,
    InventorySackComponent,

    EquipmentMainComponent,
    PlayerStatusComponent,
    CharacterListComponent
  ],
  imports: [
    HttpClientModule,
    FormsModule,
    BrowserModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    BrowserAnimationsModule,

    SharedModule,

    NgxsModule.forRoot(allActualStores, { developmentMode: !environment.production }),
    NgxsStoragePluginModule.forRoot({
      key: ['settings', 'chat.messages', 'macros']
    }),
    NgxsReduxDevtoolsPluginModule.forRoot({ disabled: environment.production }),
    NgxsResetPluginModule.forRoot(),
    NgxsLoggerPluginModule.forRoot({
      disabled: environment.production,
      collapsed: true,
      filter: action => {
        const ignoreActions: any = {
          [UpdateWindowPosition.type]: true, [SetActiveWindow.type]: true
        };
        const actionType: string = getActionTypeFromInstance(action) as string;
        return !ignoreActions[actionType];
      }
    })
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: (sc: SocketService) => () => {
        sc.init();
        return sc;
      },
      deps: [SocketService],
      multi: true
    },
    {
      provide: APP_INITIALIZER,
      useFactory: (assets: AssetService) => () => {
        assets.init();
        return assets;
      },
      deps: [AssetService],
      multi: true
    },
    {
      provide: APP_INITIALIZER,
      useFactory: (game: GameService) => () => {
        game.init();
        return game;
      },
      deps: [GameService],
      multi: true
    },
    {
      provide: APP_INITIALIZER,
      useFactory: (macros: MacrosService) => () => {
        macros.init();
        return macros;
      },
      deps: [MacrosService],
      multi: true
    },
    {
      provide: ErrorHandler,
      useClass: AlertErrorHandler,
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
