import {
  ValidatorFn,
  FormGroup,
  ValidationErrors,
  AbstractControl,
} from '@angular/forms';

export const passwordNotMatchValidator: ValidatorFn = (
  control: FormGroup
): ValidationErrors | null => {
  const pw = control.get('password');
  const pwRepeat = control.get('passwordRepeat');
  const notOk = pw.value && pwRepeat.value && pw.value !== pwRepeat.value;
  //  console.log(notOk, pw, pwRepeat);
  return notOk
    ? {
        passwordNotMatch: true,
      }
    : null;
};

export const fileSizeValidator = (maxSizeMb: number): ValidatorFn | null => {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const size = Number(control.value);
    console.log(size, maxSizeMb * 1e6);
    return size >= maxSizeMb * 1e6
      ? { fileTooLarge: { value: size / 1e6, maxSize: maxSizeMb } }
      : null;
  };
};

/**
 * min <= x < max
 * error: { outOfRange: { value: x, min: min, max: max } }
 */
export const rangeValidator = (min: number, max: number): ValidatorFn | null => {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const x = control.value;
    return min <= x && x < max
      ? null
      : { outOfRange: { value: x, min, max } };
  };
};
