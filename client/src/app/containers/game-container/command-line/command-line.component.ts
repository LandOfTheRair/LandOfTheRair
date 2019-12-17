import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { ChatMode, GameServerEvent } from '../../../../models';
import { SetChatMode, SetCurrentCommand } from '../../../../stores';
import { GameService } from '../../../game.service';
import { SocketService } from '../../../socket.service';

@Component({
  selector: 'app-command-line',
  templateUrl: './command-line.component.html',
  styleUrls: ['./command-line.component.scss']
})
export class CommandLineComponent implements OnInit {

  // TODO: ., history, #, enter from anywhere, etc.

  public placeholderTexts: { [key in ChatMode]: string } = {
    cmd: 'Enter your command here...',
    say: 'Talk to local players here...',
    party: 'Talk to your party here...',
    global: 'Talk to the lobby here...'
  };

  constructor(
    private store: Store,
    private socketService: SocketService,
    public gameService: GameService
  ) { }

  ngOnInit() {
  }

  updateChatMode(newMode) {
    this.store.dispatch(new SetChatMode(newMode.value));
  }

  updateCommand(newCommand) {
    this.store.dispatch(new SetCurrentCommand(newCommand));
  }

  sendCommand() {
    this.store.selectOnce(state => state.settings.currentCommand)
      .subscribe(command => {
        if (!command || !command.trim()) return;

        this.doCommand(command.trim());

        this.store.dispatch(new SetCurrentCommand(''));
      });
  }

  private doCommand(cmdString: string) {
    const [command, ...args] = cmdString.split(' ');
    this.socketService.emit(GameServerEvent.DoCommand, { command, args: args.join(' ') });
  }

}
