import { FormGroup } from "@angular/forms";

export const flatFormErrors = (f: FormGroup) => {
  return Object.entries(f.controls)
    .filter(([k, v]) => v.errors)
    .reduce((p, [k, v]) => (p[k] = v), {});
};

export const scrollToTop = () => {
  const scrollToTop = window.setInterval(() => {
    const pos = window.pageYOffset;
    if (pos > 0) {
      window.scrollTo(0, pos - 40); // how far to scroll on each step
    } else {
      window.clearInterval(scrollToTop);
    }
  }, 16);
};


export const ggT = (m, n) => {
  if (n === 0) {
    return m;
  } else {
    return ggT(n, m % n)
  }
}

export const kgV = (m, n) => {
  return (m * n) / ggT(m, n)
}
