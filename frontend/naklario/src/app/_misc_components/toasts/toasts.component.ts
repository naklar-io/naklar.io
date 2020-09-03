import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { ToastService } from 'src/app/_services';

@Component({
  selector: 'misc-toasts',
  templateUrl: './toasts.component.html',
  styleUrls: ['./toasts.component.scss'],
})
export class ToastsComponent implements OnInit {
  constructor(public toastService: ToastService) {}
  ngOnInit(): void {}
}
