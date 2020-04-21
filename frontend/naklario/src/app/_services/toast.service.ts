import { Injectable, TemplateRef, Inject, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from '@angular/common';

type ToastType = "danger" | "warning" | "info" | "success";

class Toast {
  constructor(
    public type: ToastType,
    public message: string,
    // options
    public classname: string = "",
    // ms
    public delay: number = 10000
  ) {}
}

@Injectable({ providedIn: "root" })
export class ToastService {

  toasts: Toast[] = [];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {

  }

  private show(toast: Toast) {
    if (isPlatformBrowser(this.platformId)){
      this.toasts.push(toast);
    } else {
      console.log("Not showing toast, because not in browser");
    }
    return toast;
  }

  error(message: string) {
    return this.show(new Toast("danger", message, "bg-danger text-light"));
  }
  warning(message: string) {
    return this.show(new Toast("warning", message, "bg-warning"));
  }
  info(message: string) {
    return this.show(new Toast("info", message));
  }
  success(message: string) {
    return this.show(new Toast("success", message, "bg-success text-light"));
  }

  remove(toast) {
    this.toasts = this.toasts.filter((t) => t !== toast);
  }
}
