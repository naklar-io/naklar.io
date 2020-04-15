import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
} from "@angular/core";
import {
  RouletteService,
  RouletteRequestType,
  ToastService,
} from "src/app/_services";
import { StorageMap } from "@ngx-pwa/local-storage";
import { Meeting } from "src/app/_models";
import { map } from "rxjs/operators";

@Component({
  selector: "roulette-session",
  templateUrl: "./session.component.html",
  styleUrls: ["./session.component.scss"],
})
export class SessionComponent implements OnInit, OnDestroy {
  @Input() readonly requestType: RouletteRequestType;
  @Input() joinUrl: string;
  @Output() done = new EventEmitter<Meeting>();

  meeting: Meeting;

  constructor(
    private rouletteService: RouletteService,
    private ts: ToastService
  ) {}

  ngOnInit(): void {
    window.addEventListener("message", (ev) => {
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

  /**
   * executed after meeting done
   */
  ngOnDestroy(): void {
    this.rouletteService.deleteMatch(this.requestType);
    this.rouletteService.endMeeting(this.meeting);
  }
}
