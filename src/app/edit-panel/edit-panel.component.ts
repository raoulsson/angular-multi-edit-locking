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

  // @Input() inEditingMode: boolean = true;
  @Input() inEditingMode: boolean = false;

  @Input() canEdit: boolean = true;

  @Output() editModeChanged: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Input() tooltip: string = "";

  @ContentChild('view') templateForView!: TemplateRef<ElementRef>;
  @ContentChild('edit') templateForEdit!: TemplateRef<ElementRef>;

  intervalRunnerService: IntervalRunnerService;

  constructor(private editLockerClientWsService: EditLockerClientWsService) {
    this.intervalRunnerService = new IntervalRunnerService(3000, () => this.sendPingLambda());

    editLockerClientWsService.genericMessageSubject.subscribe(genericMessage => {
      if (genericMessage !== undefined) {
        // console.log("Response from server mapped to type: " + genericMessage.type + ", payload: " + genericMessage.payload);
        if (genericMessage.type === 'subscribed') {
          this.intervalRunnerService.startInterval();
        }
        if (genericMessage.type === 'lock') {
          // @ts-ignore
          this.lockEditing(genericMessage.payload.lock === true, genericMessage.payload.lockedBy);
        }
      }
    });
    // TODO: fix this so we get a sync initial call without delays
    setTimeout(() => {
      this.subscribeSelf();
      setTimeout(() => {
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

  toggleEditMode(): void {
    if(!this.canEdit) {
      return;
    }
    this.inEditingMode = !this.inEditingMode;
    this.editModeChanged.emit(this.inEditingMode);
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

  private lockEditing(lock: boolean, lockedBy: string) {
    console.log("lockEditing: " + lock);
    if (lock && this.inEditingMode) {
      this.toggleEditMode();
    }
    if(lock) {
      console.log("locked by: " + lockedBy);
      this.tooltip = lockedBy + " is editing";
    } else {
      console.log("unlocked");
      this.tooltip = "Switch to Edit Mode";
    }
    this.canEdit = !lock;
  }
}
