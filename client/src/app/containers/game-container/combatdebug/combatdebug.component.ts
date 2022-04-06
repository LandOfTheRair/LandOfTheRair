import { Component, OnDestroy, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { sortBy } from 'lodash';
import { AutoUnsubscribe } from 'ngx-auto-unsubscribe';
import { Observable, Subscription } from 'rxjs';

import { GameServerResponse, IPlayer, LogInfo } from '../../../../interfaces';
import { GameState, HideWindow } from '../../../../stores';

import { GameService } from '../../../services/game.service';
import { SocketService } from '../../../services/socket.service';

@AutoUnsubscribe()
@Component({
  selector: 'app-combatdebug',
  templateUrl: './combatdebug.component.html',
  styleUrls: ['./combatdebug.component.scss']
})
export class CombatDebugComponent implements OnInit, OnDestroy {

  @Select(GameState.currentPosition) curPos$: Observable<{ x: number; y: number }>;
  @Select(GameState.currentVendorWindow) vendor$: Observable<any>;
  @Select(GameState.inGame) inGame$: Observable<any>;
  @Select(GameState.player) player$: Observable<IPlayer>;

  gameStatusSub: Subscription;

  private damageByCount: Record<string, number> = {};
  private damageByType: Record<string, number> = {};
  private storedLogs: LogInfo[] = [];
  public isLogging = false;
  public totalToLog = 1000;

  public visibleLogInfoForTable = [];

  public readonly allStats = [
    { display: 'AC',  key: 'armorClass' },
    { display: 'WAC', key: 'weaponArmorClass' },
    { display: 'M',   key: 'mitigation' },
    { display: 'D',   key: 'defense' },

    { display: 'ReM', key: 'magicalResist' },
    { display: 'ReP', key: 'physicalResist' },
    { display: 'ReN', key: 'necroticResist' },
    { display: 'ReE', key: 'energyResist' },
    { display: 'ReW', key: 'waterResist' },
    { display: 'ReF', key: 'fireResist' },
    { display: 'ReI', key: 'iceResist' },
    { display: 'ReP', key: 'poisonResist' },
    { display: 'ReD', key: 'diseaseResist' },
  ];

  public get totalLogged() {
    return this.storedLogs.length;
  }

  constructor(
    private store: Store,
    private socketService: SocketService,
    public gameService: GameService
  ) { }

  ngOnInit() {
    this.gameStatusSub = this.inGame$.subscribe(() => {
      this.store.dispatch(new HideWindow('combatdebug'));
    });

    this.socketService.registerComponentCallback('CombatDebug', GameServerResponse.GameLog, (data) => {
      if (!data.logInfo || !this.isLogging) return;

      if (this.totalLogged >= this.totalToLog) return;

      this.storedLogs.push(data.logInfo);

      this.addLogInfo(data.logInfo);
    });
  }

  ngOnDestroy() {
    this.socketService.unregisterComponentCallbacks('CombatDebug');
  }

  private addLogInfo(loginfo: LogInfo): void {

    let type = loginfo.type;
    if (type === 'damage') {
      type = `damage-${loginfo.weapon}`;
    }

    this.damageByType[type] = this.damageByType[type] || 0;
    this.damageByCount[type] = this.damageByCount[type] || 0;

    this.damageByType[type] += loginfo.damage;
    this.damageByCount[type]++;

    this.recalculateTable();
  }

  private recalculateTable(): void {
    const damageByType = Object.keys(this.damageByType).map(x => ({
      type: x,
      totalDamage: this.damageByType[x],
      times: this.damageByCount[x]
    }));

    this.visibleLogInfoForTable = sortBy(damageByType, ['totalDamage', 'times']).reverse();
  }

  private logToCSV(): string {
    const columns = Object.keys(this.storedLogs[0]);
    const data = this.storedLogs.map(x => columns.map(c => x[c]).join(','));

    return `${columns}\n${data.join('\n')}`;
  }

  public toggleLogging() {
    this.isLogging = !this.isLogging;

    if (!this.isLogging) {
      this.storedLogs = [];
      this.damageByCount = {};
      this.damageByType = {};
    }
  }

  public downloadCSV() {
    const fileName = `lotr-combatlog-${Date.now()}.csv`;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(this.logToCSV());
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href',     dataStr);
    downloadAnchorNode.setAttribute('download', fileName);
    downloadAnchorNode.click();
  }

}
