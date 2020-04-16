import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewInit,
  HostListener,
  Renderer2,
} from "@angular/core";
import {
  RouletteService,
  RouletteRequestType,
  ToastService,
} from "src/app/_services";
import { Meeting } from "src/app/_models";
import { map } from "rxjs/operators";

@Component({
  selector: "roulette-session",
  templateUrl: "./session.component.html",
  styleUrls: ["./session.component.scss"],
})
export class SessionComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() readonly requestType: RouletteRequestType;
  @Input() joinUrl: string;
  @Output() done = new EventEmitter<Meeting>();
  @ViewChild("iframe") iframe: ElementRef;

  meeting: Meeting;

  constructor(
    private rouletteService: RouletteService,
    private ts: ToastService,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    window.addEventListener("message", (ev) => {
      console.log("got bbb event", ev);
      if (ev.data.response === "notInAudio") {
        console.log("bbb-session-done", ev);
        this.done.emit(this.meeting);
      }
    });
    const url = new URL(this.joinUrl);
    const meetingID = url.searchParams.get("meetingID");

    this.joinUrl = url.toString();
    console.log("opening iframe: ", this.joinUrl);
    this.rouletteService
      .getMeetings()
      .pipe(map((m) => m.find((x) => x.meeting_id === meetingID)))
      .subscribe(
        (meeting) => (this.meeting = meeting),
        (error) => this.ts.error(error)
      );
  }

  ngAfterViewInit(): void {
    //    this.onResize(window.innerHeight);
  }

  /**
  // This is kind of hacky and not very performant but works:
  // The idea is to set the iframe height to the remaining viewport height
  // after subtracting its top left position.
  @HostListener("window:resize", ["$event"])
  @HostListener("window:scroll", ["$event"])
  onViewportChange(event) {
    this.onResize(window.innerHeight);
  }
  onResize(innerHeight: number) {
    const height = `${
      innerHeight - this.iframe.nativeElement.getBoundingClientRect().y
    } px`;
    console.log(
      "updating height: ",
      innerHeight,
      this.iframe.nativeElement.getBoundingClientRect(),
      height
    );
    this.iframe.nativeElement.height = height;
  } */

  /**
   * executed after meeting done
   */
  ngOnDestroy(): void {
    this.rouletteService.deleteMatch(this.requestType);
    this.rouletteService.endMeeting(this.meeting);
  }
}
