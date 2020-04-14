import { Injectable, TemplateRef } from "@angular/core";

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

  private show(toast: Toast) {
    this.toasts.push(toast);
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
