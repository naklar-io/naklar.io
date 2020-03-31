import { Injectable, Directive, Input } from "@angular/core";
import {
  AsyncValidator,
  AbstractControl,
  ValidationErrors,
  NG_VALIDATORS
} from "@angular/forms";
import { Observable, of } from "rxjs";
import { catchError, map } from "rxjs/operators";

import { EmailFormService } from "./email-form.service";

@Directive({
  selector: "[appUniqueEmailAddress]",
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: UniqueEmailAddressValidator,
      multi: true
    }
  ]
})
@Injectable({ providedIn: "root" })
export class UniqueEmailAddressValidator implements AsyncValidator {
  @Input("appUniqueEmailAddress") emailAddress: string;
  
  constructor(private emailFormService: EmailFormService) {}

  validate(
    ctrl: AbstractControl
  ): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {
    console.log("validation request", ctrl);
    return this.emailFormService.emailTaken.pipe(
      map(isTaken => (isTaken ? { uniqueEmail: true } : null)),
      catchError(() => of(null))
    );
  }
}
