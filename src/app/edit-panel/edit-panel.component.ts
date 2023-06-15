import {
  AfterViewInit,
  Component, ComponentRef,
  ContentChild,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  TemplateRef, ViewChild, ViewContainerRef
} from '@angular/core';
import {IntervalRunnerService} from "../interval-runner.service";
import {GenericMessage} from "../generic-message";
import {EditLockerClientWsService} from "../edit-locker-client-ws.service";
import {Log} from "../log";
import {GetClientIdComponent} from "../get-client-id/get-client-id.component";

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
  lockedByUser: string = "";

  @ContentChild('view') templateForView!: TemplateRef<ElementRef>;
  @ContentChild('edit') templateForEdit!: TemplateRef<ElementRef>;

  intervalRunnerService: IntervalRunnerService;
  clientId: string | undefined;
  holdingLock: boolean = false;

  constructor(private editLockerClientWsService: EditLockerClientWsService, private getClientIdComponent: GetClientIdComponent) {
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
          clientId: this.clientId!,
          payload: 'alive!'
        };
        this.editLockerClientWsService.genericMessageSubject.next(pingMessage);
      }, 1000);
    }, 1000);

  }

  private async subscribeSelf() {
    await this.getClientId();
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
      clientId: this.clientId!,
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

  async toggleEditMode(): Promise<void> {
    if (!this.canEdit) {
      this.showModal("You can not edit this element right now. It is locked by " + this.lockedByUser + ".");
      return;
    }
    // We enter edit mode
    if (!this.holdingLock) {
      const acquireLock = await this.acquireLock();
      if (acquireLock) {
        this.holdingLock = true;
        this.inEditingMode = !this.inEditingMode;
        this.editModeChanged.emit(this.inEditingMode);
      } else {
        this.showModal("You can not edit this element right now. Should have worked but seems to be an edge case.");
      }
    } else {
      // We end editing
      const releaseLock = await this.releaseLock();
      if (releaseLock) {
        this.holdingLock = false;
        this.inEditingMode = !this.inEditingMode;
        this.editModeChanged.emit(this.inEditingMode);
      } else {
        this.showModal("You can not let go of the lock. Should have worked but seems to be an edge case.");
      }
    }
  }

  private sendPingLambda() {
    let pingMessage: GenericMessage = {
      type: 'ping',
      clientId: this.clientId!,
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
    this.releaseLock().then(r => {
      console.log("Released lock: " + r)
      this.intervalRunnerService.stopInterval();
      this.unsubscribeSelf();
    });
  }

  private lockEditing(lock: boolean, lockedBy: string) {
    this.lockedByUser = lockedBy;
    if (lock && this.inEditingMode) {
      this.showModal("Someone else is editing. Somehow your edit mode was not published. Should not happen. Please report this bug.");
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
    this.logs.unshift(log);
  }

  private showModal(message: string) {
    console.log("Modal message: " + message);
    this.modalText = message;
    setTimeout(() => {
      this.modalText = "(no text)";
    }, 5000);
  }

  private async getClientId() {
    this.clientId = await this.getClientIdComponent.getClientId()
  }

  private async acquireLock() {
    const lockMessage: GenericMessage = {
      type: 'acquireLock',
      clientId: this.clientId!,
      payload: await this.uniqueEditableId(),
    };
    // TODO: fix this. for now we just assume it worked. For now the server will send the lock messages to all clients as if.
    this.editLockerClientWsService.genericMessageSubject.next(lockMessage);
    return true;
  }

  private async releaseLock() {
    const lockMessage: GenericMessage = {
      type: 'releaseLock',
      clientId: this.clientId!,
      payload: await this.uniqueEditableId(),
    };
    // TODO: fix this. for now we just assume it worked. For now the server will send the lock messages to all clients as if.
    this.editLockerClientWsService.genericMessageSubject.next(lockMessage);
    return true;
  }
}
