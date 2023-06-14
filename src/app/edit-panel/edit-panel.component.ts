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
        if (genericMessage.type === 'subscribed') {
          this.intervalRunnerService.startInterval();
        }
      }
    });
    // TODO: fix this so we get a sync initial call without delays
    setTimeout(() => {
      console.log('sleep');
      this.subscribeSelf();
      setTimeout(() => {
        console.log('sleep');
        let pingMessage: GenericMessage = {
          type: 'ping',
          payload: 'alive!'
        };
        this.editLockerClientWsService.genericMessageSubject.next(pingMessage);
      }, 1000);
    }, 1000);
  }

  private subscribeSelf() {
    this.subscriptionMessage(true).then(genericMessage => {
      this.editLockerClientWsService.genericMessageSubject.next(genericMessage);
    });
  }

  private unsubscribeSelf() {
    this.subscriptionMessage(false).then(genericMessage => {
      this.editLockerClientWsService.genericMessageSubject.next(genericMessage);
    });
  }

  private async subscriptionMessage(subscribe: boolean): Promise<GenericMessage> {
    return {
      type: subscribe ? 'subscribe' : 'unsubscribe',
      payload: await this.uniqueEditableId(),
    };
  }

  /**
   * https://stackoverflow.com/a/57385857/132396
   * @private
   */
  private async uniqueEditableId() {
    return this.computeHash(this.templateForView);
  }

  private async computeHash(data: any): Promise<string> {
    const msgUint8 = new TextEncoder().encode(data)
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  switchToEditMode(): void {
    this.inEditingMode = true;
  }

  toggleEditMode(): void {
    if (this.inEditingMode) {
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
