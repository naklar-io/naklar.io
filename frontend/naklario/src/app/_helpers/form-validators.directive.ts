import { ValidatorFn, FormGroup, ValidationErrors } from "@angular/forms";

export const passwordNotMatchValidator: ValidatorFn = (
  control: FormGroup
): ValidationErrors | null => {
  const pw = control.get("password");
  const pwRepeat = control.get("passwordRepeat");
  const notOk = pw.value && pwRepeat.value && pw.value !== pwRepeat.value;
  //  console.log(notOk, pw, pwRepeat);
  return notOk
    ? {
        passwordNotMatch: true
      }
    : null;
};
