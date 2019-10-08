import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { NgxsModule } from '@ngxs/store';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { NgxsStoragePluginModule } from '@ngxs/storage-plugin';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';
import { NgxsResetPluginModule } from 'ngxs-reset-plugin';

import * as AllStores from '../stores';
import { SocketService } from './socket.service';
import { LoginComponent } from './login/login.component';
import { SharedModule } from './shared.module';
import { MenuComponent } from './menu/menu.component';
import { GameContainerComponent } from './containers/game-container/game-container.component';
import { LobbyContainerComponent } from './containers/lobby-container/lobby-container.component';
import { OptionsContainerComponent } from './containers/options-container/options-container.component';
import { LobbyComponent } from './containers/lobby-container/lobby/lobby.component';
import { CharSelectComponent } from './containers/lobby-container/char-select/char-select.component';
import { CharCreateComponent } from './containers/lobby-container/char-create/char-create.component';

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
    CharCreateComponent
  ],
  imports: [
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
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
