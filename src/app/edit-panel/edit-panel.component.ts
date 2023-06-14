import {Component, ContentChild, ElementRef, EventEmitter, Input, OnDestroy, Output, TemplateRef} from '@angular/core';
import {IntervalRunnerService} from "../interval-runner.service";
import {GenericMessage} from "../generic-message";
import {EditLockerClientWsService} from "../edit-locker-client-ws.service";

@Component({
  selector: 'app-edit-panel',
  templateUrl: './edit-panel.component.html',
  styleUrls: ['./edit-panel.component.css']
})
export class EditPanelComponent implements OnDestroy {

  @Input() inEditingMode: boolean = true;
  // @Input() inEditingMode: boolean = false;

  @Output() editModeChanged: EventEmitter<boolean> = new EventEmitter<boolean>();

  @ContentChild('view') templateForView!: TemplateRef<ElementRef>;
  @ContentChild('edit') templateForEdit!: TemplateRef<ElementRef>;

  intervalRunnerService: IntervalRunnerService;

  constructor(private editLockerClientWsService: EditLockerClientWsService) {
    this.intervalRunnerService = new IntervalRunnerService(() => this.sendPingLambda());

    editLockerClientWsService.genericMessageSubject.subscribe(genericMessage => {
      if (genericMessage !== undefined) {
        console.log("Response from server mapped to type: " + genericMessage.type + ", payload: " + genericMessage.payload);
        if(genericMessage.type === 'subscribed') {
          this.intervalRunnerService.startInterval();
        }
      }
    });
    setTimeout(() => {
      console.log('sleep');
      this.subscribeSelf();
      let pingMessage: GenericMessage = {
        type: 'ping',
        payload: 'alive!'
      };
      this.editLockerClientWsService.genericMessageSubject.next(pingMessage);
    }, 1000);

  }

  private subscribeSelf() {
    this.editLockerClientWsService.genericMessageSubject.next(this.subscriptionMessage(true));
  }

  private unsubscribeSelf() {
    this.editLockerClientWsService.genericMessageSubject.next(this.subscriptionMessage(false));
  }

  private subscriptionMessage(subscribe: boolean): GenericMessage {
    return {
      type: subscribe ? 'subscribe' : 'unsubscribe',
      payload: this.uniqueEditableId(),
    };
  }

  private uniqueEditableId() {
    return 'sadf';
  }

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
    let pingMessage: GenericMessage = {
      type: 'ping',
      payload: 'alive!'
    };
    this.editLockerClientWsService.genericMessageSubject.next(pingMessage);
  }

  private sendPingLambda() {
    console.log('ping');
    let pingMessage: GenericMessage = {
      type: 'ping',
      payload: 'alive!'
    };
    this.editLockerClientWsService.genericMessageSubject.next(pingMessage);
  }

  ngOnDestroy(): void {
    this.intervalRunnerService.stopInterval();
    this.unsubscribeSelf();
  }

}
