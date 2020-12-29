import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { BehaviorSubject, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AccessCode } from 'src/app/_models';
import { AccessCodeService } from 'src/app/_services/database/account/access-code.service';

@Component({
    selector: 'account-access-code',
    templateUrl: './access-code.component.html',
    styleUrls: ['./access-code.component.scss'],
})
export class AccessCodeComponent implements OnInit {
    codes$: Observable<AccessCode[]>;
    refresh$ = new BehaviorSubject(null);
    loading = false;
    error: string;
    enteredCode: string;

    constructor(private accessCodeService: AccessCodeService) {}

    ngOnInit(): void {
        this.codes$ = this.refresh$.pipe(switchMap(() => this.accessCodeService.list()));
    }

    onCodeEntry(form: NgForm): void {
        console.log('form submitted', this.enteredCode);
        this.loading = true;
        this.error = '';
        this.accessCodeService.redeemCode(this.enteredCode).subscribe(
            (value) => {
                this.enteredCode = '';
                this.loading = false;
                this.refresh$.next(null);
                form.reset();
            },
            (error) => {
                this.loading = false;
                this.error = error;
            }
        );
    }
    
    toUpperCase(event): void {
      this.enteredCode = this.enteredCode.toUpperCase();
    }
}
