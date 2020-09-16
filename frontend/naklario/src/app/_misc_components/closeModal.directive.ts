import {
  Directive,
  ElementRef,
  Output,
  EventEmitter,
  HostListener,
} from '@angular/core';

@Directive({
  selector: '[appCloseModal]',
})
export class CloseModalDirective {
  constructor(private elementRef: ElementRef) {}

  @Output() public appCloseModal = new EventEmitter<void>();

  @HostListener('document:click', ['$event.target'])
  public onClick(targetElement) {
    const clickedInside = this.elementRef.nativeElement.contains(
      targetElement
    );
    if (!clickedInside) {
      this.appCloseModal.emit();
    }
  }
  @HostListener('document:keyup.escape', ['$event'])
  public onKeyHandle(event: KeyboardEvent) {
    this.appCloseModal.emit();
  }
}
