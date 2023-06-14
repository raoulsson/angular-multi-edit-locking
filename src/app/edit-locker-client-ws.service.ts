import {Injectable} from '@angular/core';
import {Observable, Observer, Subject} from 'rxjs';
import {AnonymousSubject} from 'rxjs/internal/Subject';
import {map} from 'rxjs/operators';
import {Message} from "./message";
import {GenericMessage} from "./generic-message";

const EDIT_LOCKER_ENDPOINT = "ws://localhost:9074";

@Injectable({
  providedIn: 'root'
})
export class EditLockerClientWsService {

  private subject: AnonymousSubject<MessageEvent> | undefined
  public genericMessageSubject: Subject<GenericMessage>;

  constructor() {
    this.genericMessageSubject = <Subject<GenericMessage>>this.connect(EDIT_LOCKER_ENDPOINT).pipe(
      map(
        (response: MessageEvent): GenericMessage | undefined => {
          const json = JSON.parse(response.data);
          console.log('json: ', json);
          if(json.type === 'pong') {
            console.log('pong received');
            return undefined;
          } else {
            return {
              type: json.type,
              payload: json.payload
            };
          }
        }
      )
    );
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
