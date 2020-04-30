import {
  Directive,
  ElementRef,
  Output,
  EventEmitter,
  HostListener,
} from "@angular/core";

@Directive({
  selector: "[closeModal]",
})
export class CloseModalDirective {
  constructor(private _elementRef: ElementRef) {}

  @Output() public closeModal = new EventEmitter<void>();

  @HostListener("document:click", ["$event.target"])
  public onClick(targetElement) {
    const clickedInside = this._elementRef.nativeElement.contains(
      targetElement
    );
    if (!clickedInside) {
      this.closeModal.emit();
    }
  }
  @HostListener("document:keyup.escape", ["$event"])
  public onKeyHandle(event: KeyboardEvent) {
    this.closeModal.emit();
  }
}
