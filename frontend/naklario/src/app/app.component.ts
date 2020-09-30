import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  Renderer2,
  AfterViewInit,
  DoCheck, HostListener
} from '@angular/core';
import {
  NotifyService,
  PromptUpdateService,
  AppLayoutService,
} from './_services';
import { ScrollPositionService } from './_services/scroll-position.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [AppLayoutService, ScrollPositionService]
})
export class AppComponent implements OnInit, AfterViewInit, DoCheck {
  @ViewChild('app') app: ElementRef;
  @ViewChild('main') main: ElementRef;

  public fullscreen = false;

  title = 'naklar.io';
  constructor(
    private notify: NotifyService,
    private promptUpdate: PromptUpdateService,
    private layoutService: AppLayoutService,
    private renderer: Renderer2,
    private scrollPosition: ScrollPositionService
  ) {
    this.promptUpdate.checkForUpdates();

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
          this.renderer.removeClass(this.app.nativeElement, 'noscroll');
        } catch {
          console.error('couldnt remove scrollable class');
        }
      } else {
        this.renderer.addClass(this.app.nativeElement, 'noscroll');
      }
    });
    this.main.nativeElement.addEventListener('scroll', (event) => {
      this.scrollPosition.updateScroll(event);
    });

  }

  ngOnInit(): void {
  }
}
