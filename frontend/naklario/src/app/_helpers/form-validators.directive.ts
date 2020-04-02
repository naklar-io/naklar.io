import {
  ValidatorFn,
  FormGroup,
  ValidationErrors,
} from "@angular/forms";

export const passwordNotMatchValidator: ValidatorFn = (
  control: FormGroup
): ValidationErrors | null => {

  const pw = control.get("password");
  const pwRepeat = control.get("passwordRepeat");
  return pw && pwRepeat && pw.value !== pwRepeat.value
    ? {
        passwordNotMatch: true
      }
    : null;
};
