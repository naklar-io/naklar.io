import { Component, OnInit } from '@angular/core';
import { TrackingConsentService } from 'src/app/_services/tracking-consent.service';

@Component({
  selector: 'app-privacy',
  templateUrl: './privacy.component.html',
  styleUrls: ['./privacy.component.scss']
})
export class PrivacyComponent implements OnInit {


  constructor(public trackingConsent: TrackingConsentService) {

  }

  ngOnInit(): void {
  }

}
