import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  Renderer2,
  AfterViewInit,
  DoCheck,
} from "@angular/core";
import {
  NotifyService,
  PromptUpdateService,
  AppLayoutService,
} from "./_services";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
  providers: [AppLayoutService]
})
export class AppComponent implements OnInit, AfterViewInit, DoCheck {
  @ViewChild("main") main: ElementRef;

  public fullscreen: boolean = false;

  title = "naklar.io";
  constructor(
    private notify: NotifyService,
    private promptUpdate: PromptUpdateService,
    private layoutService: AppLayoutService,
    private renderer: Renderer2
  ) {
    
  }
  ngDoCheck(): void {
    if (this.fullscreen !== this.layoutService.isFullscreen){
      this.fullscreen = this.layoutService.isFullscreen;
    }
  }
  ngAfterViewInit(): void {
    this.layoutService.scrollable$.subscribe((scrollable) => {
      if (scrollable) {
        try {
          this.renderer.removeClass(this.main.nativeElement, "noscroll");
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
