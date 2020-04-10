import { FormGroup } from "@angular/forms";

export const flatFormErrors = (f: FormGroup) => {
  return Object.entries(f.controls)
    .filter(([k, v]) => v.errors)
    .reduce((p, [k, v]) => (p[k] = v), {});
};
