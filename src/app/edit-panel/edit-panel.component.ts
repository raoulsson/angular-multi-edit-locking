import {
  AfterViewInit,
  Component, ComponentRef,
  ContentChild,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output, QueryList,
  TemplateRef, ViewChild, ViewChildren, ViewContainerRef
} from '@angular/core';
import {IntervalRunnerService} from "../interval-runner.service";
import {GenericMessage} from "../generic-message";
import {EditLockerClientWsService} from "../edit-locker-client-ws.service";
import {Message} from "../message";
import {Log} from "../log";

@Component({
  selector: 'app-edit-panel',
  templateUrl: './edit-panel.component.html',
  styleUrls: ['./edit-panel.component.css']
})
export class EditPanelComponent implements OnDestroy, AfterViewInit {
  // https://stackoverflow.com/questions/48330760/cannot-read-property-viewcontainerref-of-undefined
  @ViewChild('dynamicComponentContainer', { read: ViewContainerRef }) dynamicComponentContainer!: ViewContainerRef;
  dynamicComponentRef!: ComponentRef<any>;

  // @Input() inEditingMode: boolean = true;
  @Input() inEditingMode: boolean = false;

  @Input() canEdit: boolean = true;

  @Output() editModeChanged: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Input() tooltip: string = "loading...";
  @Input() modalText: string = "(no text)";
  @Input() logs: Log[] = [];

  @ContentChild('view') templateForView!: TemplateRef<ElementRef>;
  @ContentChild('edit') templateForEdit!: TemplateRef<ElementRef>;

  intervalRunnerService: IntervalRunnerService;

  constructor(private editLockerClientWsService: EditLockerClientWsService) {
    this.intervalRunnerService = new IntervalRunnerService(3000, () => this.sendPingLambda());

    editLockerClientWsService.genericMessageSubject.subscribe(genericMessage => {
      if (genericMessage !== undefined) {
        console.log("Message from server: " + genericMessage.type + ", payload: " + genericMessage.payload);
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
    const msgUint8 = new TextEncoder().encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 12);
  }

  toggleEditMode(): void {
    if(!this.canEdit) {
      return;
    }
    this.inEditingMode = !this.inEditingMode;
    this.editModeChanged.emit(this.inEditingMode);
  }

  private sendPingLambda() {
    let pingMessage: GenericMessage = {
      type: 'ping',
      payload: 'alive!'
    };
    this.editLockerClientWsService.genericMessageSubject.next(pingMessage);
  }

  ngAfterViewInit(): void {
    if (this.dynamicComponentRef) {
      const dynamicComponent = this.dynamicComponentRef.instance;
      console.log(">>>" + dynamicComponent.toString());
      // const fingerprintHash = this.createFingerprintHash(dynamicComponent.data);
      // console.log(fingerprintHash);
    }
  }

  ngOnDestroy(): void {
    this.intervalRunnerService.stopInterval();
    this.unsubscribeSelf();
  }

  private lockEditing(lock: boolean, lockedBy: string) {
    if (lock && this.inEditingMode) {
      this.toggleEditMode();
    }
    if(lock) {
      this.addLog("locked by: " + lockedBy);
      this.tooltip = lockedBy + " is editing";
    } else {
      this.addLog("unlocked");
      this.tooltip = "Switch to Edit Mode";
    }
    this.canEdit = !lock;
  }

  private addLog(message: string) {
    console.log(message);
    let log: Log = {
      time: new Date().toISOString(),
      message: message,
    }
    this.logs.push(log);
  }

}
