import {Component} from '@angular/core';
import {WsClientService} from "../ws-client.service";
import {Message} from "../message";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
  providers: [WsClientService]
})
export class ChatComponent {
  title: string = 'socketrv';
  content: string = '';
  received: Message[] = [];
  sent: Message[] = [];

  constructor(private wsClientService: WsClientService) {
    wsClientService.messages.subscribe(message => {
      if(message !== undefined) {
        this.received.push(message);
        console.log("Response from server mapped to message: " + message.source + ", payload: " + message.content);
      }

    });
    this.startHeartbeat();
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
  }

  private startHeartbeat() {
    setInterval(() => {
      console.log('ping');
      let message: Message = {
        type: 'ping',
        source: '',
        content: ''
      };
      message.source = 'localhost';
      message.content = 'ping';

      this.wsClientService.messages.next(message);
    }, 1 * 1000);
  }

}
