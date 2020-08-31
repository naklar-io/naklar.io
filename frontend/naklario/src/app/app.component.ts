import { Component, OnInit, ViewChild, ElementRef, Renderer2, AfterViewInit } from "@angular/core";
import { NotifyService, PromptUpdateService, ScrollableService } from "./_services";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit, AfterViewInit{
  

  @ViewChild("main") main: ElementRef;

  title = "naklar.io";
  constructor(
    private notify: NotifyService,
    private promptUpdate: PromptUpdateService,
    private scrollableService: ScrollableService,
    private renderer: Renderer2
  ) {
  }
  ngAfterViewInit(): void {
    this.scrollableService.scrollable$.subscribe((scrollable) => {
      if(scrollable) {
        try {
          this.renderer.removeClass(this.main.nativeElement , "noscroll");
        } catch {
          console.error("couldnt remove scrollable class");
        }
      } else {
        this.renderer.addClass(this.main.nativeElement, "noscroll");
      }
    });
  }
  ngOnInit(): void {
  }

}
