import {Injectable} from '@angular/core';
import {Observable, Observer, Subject} from 'rxjs';
import {AnonymousSubject} from 'rxjs/internal/Subject';
import {map} from 'rxjs/operators';
import {Message} from "./message";
import {reportUnhandledError} from "rxjs/internal/util/reportUnhandledError";

const CHAT_URL = "ws://localhost:8081";

@Injectable({
  providedIn: 'root'
})
export class WsClientService {

  private subject: AnonymousSubject<MessageEvent> | undefined
  public messages: Subject<Message>;

  constructor() {
    this.messages = <Subject<Message>>this.connect(CHAT_URL).pipe(
      map(
        (response: MessageEvent): Message | undefined => {
          const json = JSON.parse(response.data);
          // console.log('json: ', json);
          if(json.type === 'pong') {
            console.log('pong received');
            return undefined;
          } else {
            let message: Message = {
              type: '',
              source: '',
              content: ''
            };
            message.type = json.type;
            message.source = 'server';
            message.content = json.payload;
            return message;
          }
        }
      )
    );
    console.log('constructor setup')

  }

  public connect(url: string): AnonymousSubject<MessageEvent> {
    if (!this.subject) {
      this.subject = this.create(url);
      console.log("Successfully connected: " + url);
    }
    return this.subject;
  }

  private create(url: string): AnonymousSubject<MessageEvent> {
    let ws = new WebSocket(url);
    let observable = new Observable((obs: Observer<MessageEvent>) => {
      ws.onmessage = obs.next.bind(obs);
      ws.onerror = obs.error.bind(obs);
      ws.onclose = obs.complete.bind(obs);
      return ws.close.bind(ws);
    });
    let observer: Observer<MessageEvent<Message>> = {
      error: (err: any) => console.log(err),
      complete: () => console.log('Connection closed'),
      next: (data: Object) => {
        console.log('Message sent to websocket: ', data);
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(data));
        }
      }
    };
    // return Subject.create(observer, observable);
    return new AnonymousSubject<MessageEvent<Message>>(observer, observable);
  }


}
