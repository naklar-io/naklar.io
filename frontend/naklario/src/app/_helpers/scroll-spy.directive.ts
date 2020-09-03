import { Directive, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Directive({
  selector: '[appScrollSpy]'
})
export class ScrollSpyDirective {
  @Input() public spiedTags = [];
  @Input() public spyBottom = true;
  @Output() public sectionChange = new EventEmitter<string>();
  private currentSection: string;

  constructor(private ref: ElementRef) {}

  @HostListener('window:scroll', ['$event'])
  onScroll() {
    let currentSection: string;
    const children = this.ref.nativeElement.children;
    const scrollTop = window.scrollY;
    const parentOffset = this.spyBottom ? window.innerHeight : 66; // 66 refers to the navbar height
    for (const element of children) {
      if (this.spiedTags.some(spiedTag => spiedTag === element.tagName)) {
        if ((element.offsetTop - parentOffset) <= scrollTop) {
          currentSection = element.id;
        }
      }
    }
    if (currentSection !== this.currentSection) {
      this.currentSection = currentSection;
      this.sectionChange.emit(this.currentSection);
    }
  }
}
