import { Component, ContentChild, ElementRef, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
import {webSocket} from 'rxjs/webSocket';
import {Message} from "../message";

@Component({
  selector: 'app-edit-panel',
  templateUrl: './edit-panel.component.html',
  styleUrls: ['./edit-panel.component.css']
})
export class EditPanelComponent {

  @Input() inEditingMode: boolean = true;
  // @Input() inEditingMode: boolean = false;

  @Output() editModeChanged: EventEmitter<boolean> = new EventEmitter<boolean>();

  @ContentChild('view') templateForView!: TemplateRef<ElementRef>;
  @ContentChild('edit') templateForEdit!: TemplateRef<ElementRef>;

  subject$ = webSocket({url:'ws://localhost:8081'});

  switchToEditMode(): void {
    this.inEditingMode = true;
  }

  toggleEditMode(): void {
    if(this.inEditingMode)  {
      // send a message to the server
      // send to server i want to edit, and handle yes/no response
      // sync call

    } else {
      // the opposite: unlock
    }
    this.inEditingMode = !this.inEditingMode;
    this.editModeChanged.emit(this.inEditingMode);
  }

  // private startHeartbeat() {
    // setInterval(() => {
    //   console.log('ping');
    //   let message: Message = {
    //     type: 'ping',
    //     source: '',
    //     content: ''
    //   };
    //   message.source = 'localhost';
    //   message.content = 'ping';
    //
    //   //this.wsClientService.messages.next(message);
    // }, 1 * 1000);
  // }

}
// /////////////////////////////////////////////////////////////////////////////
// // Start: Websocket, rxjs. Blocking multi-edit
// /////////////////////////////////////////////////////////////////////////////
// import {webSocket} from "ws";
//
//
// const subject$ = webSocket({url:'ws://localhost:8081'});
//
// // listen to messages from the server
// const subscription1 = subject$.subscribe(msg => {
//   console.log('message received: ' + JSON.stringify(msg));
// });
//
// // send a message to the server
// subject$.next({message: 'hello world'});
