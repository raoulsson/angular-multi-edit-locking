import {Component, Inject, Input, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {GetIdServiceService} from "../get-id-service.service";

@Component({
  selector: 'app-get-client-id',
  templateUrl: './get-client-id.component.html',
  styleUrls: ['./get-client-id.component.css']
})
export class GetClientIdComponent {
  @Input() clientId: string | undefined;

  constructor(
    private getIdServiceService: GetIdServiceService,
    private router: Router,
    private route: ActivatedRoute) {
  }

  async getClientId(): Promise<string | undefined> {
    return await this.getIdServiceService.get();
  }

  // ngOnInit(): void {
  //   this.getClientId();
  // }

}
