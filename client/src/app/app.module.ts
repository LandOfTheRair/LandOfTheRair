import { HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { AppComponent } from './app.component';

import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';
import { NgxsStoragePluginModule } from '@ngxs/storage-plugin';
import { NgxsModule } from '@ngxs/store';
import { NgxsResetPluginModule } from 'ngxs-reset-plugin';

import { AssetService } from './asset.service';
import { SocketService } from './socket.service';

import * as AllStores from '../stores';
import { GameContainerComponent } from './containers/game-container/game-container.component';
import { MapComponent } from './containers/game-container/map/map.component';
import { CharCreateComponent } from './containers/lobby-container/char-create/char-create.component';
import { CharSelectComponent } from './containers/lobby-container/char-select/char-select.component';
import { LobbyContainerComponent } from './containers/lobby-container/lobby-container.component';
import { LobbyComponent } from './containers/lobby-container/lobby/lobby.component';
import { OptionsContainerComponent } from './containers/options-container/options-container.component';
import { LoginComponent } from './login/login.component';
import { MenuComponent } from './menu/menu.component';
import { SharedModule } from './shared.module';

const allActualStores = Object.keys(AllStores).filter(x => x.includes('State')).map(x => AllStores[x]);

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
    MapComponent
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
      key: ['settings', 'chat.messages']
    }),
    NgxsReduxDevtoolsPluginModule.forRoot({ disabled: environment.production }),
    NgxsResetPluginModule.forRoot(),
    NgxsLoggerPluginModule.forRoot({ disabled: environment.production })

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
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
