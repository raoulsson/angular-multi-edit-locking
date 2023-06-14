import {Component, OnDestroy, Inject} from '@angular/core';
import {WsClientService} from "../ws-client.service";
import {Message} from "../message";
import {IntervalRunnerService} from "../interval-runner.service";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
  providers: [WsClientService]
})
export class ChatComponent implements OnDestroy {
  content: string = '';
  received: Message[] = [];
  sent: Message[] = [];
  intervalRunnerService: IntervalRunnerService;

  constructor(private wsClientService: WsClientService) {
    wsClientService.messages.subscribe(message => {
      if (message !== undefined) {
        this.received.push(message);
        console.log("Response from server mapped to message: " + message.source + ", payload: " + message.content);
      }
    });
    this.intervalRunnerService = new IntervalRunnerService(1000, () => this.runPingLambda());
    this.intervalRunnerService.startInterval();
  }

  sendMsg() {
    let message: Message = {
      type: 'message',
      source: '',
      content: ''
    };
    message.source = 'localhost';
    message.content = this.content;

    this.sent.push(message);
    this.wsClientService.messages.next(message);
    this.intervalRunnerService.setIntervalLength(10);
  }

  private runPingLambda() {
    console.log('ping');
    let message: Message = {
      type: 'ping',
      source: '',
      content: ''
    };
    message.source = 'localhost';
    message.content = 'ping';

    this.wsClientService.messages.next(message);
  }

  ngOnDestroy(): void {
    this.intervalRunnerService.stopInterval();
  }

}
