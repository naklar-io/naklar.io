import { Directive, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core'

@Directive({
  selector: '[bodyScrollSpy]'
})
export class ScrollSpyDirective {
  @Input() public spiedTags = [];
  @Input() public spyBottom = true
  @Output() public sectionChange = new EventEmitter<string>();
  private currentSection: string;

  constructor(private _el: ElementRef) {}

  @HostListener('window:scroll', ['$event'])
  onScroll() {
    let currentSection: string;
    const children = this._el.nativeElement.children;
    const scrollTop = window.scrollY;
    const parentOffset = this.spyBottom ? window.innerHeight : 66; // 66 refers to the navbar height
    for (let i = 0; i < children.length; i++) {
      const element = children[i];
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
