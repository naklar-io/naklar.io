import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { RouletteRoutingModule } from "./roulette-routing.module";
import { ReactiveFormsModule } from "@angular/forms";
import { RouletteComponent } from "./roulette.component";
import { StudentComponent } from "./student/student.component";
import { Ng5SliderModule } from "ng5-slider";
import { WaitComponent } from "./wait/wait.component";
import { MiscComponentsModule } from "../_misc_components/misc-components.module";
import { SessionComponent } from "./session/session.component";
import { FeedbackComponent } from "./feedback/feedback.component";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { ReportComponent } from './feedback/report/report.component';
import { InstructionVideoComponent } from './student/instruction-video/instruction-video.component';

@NgModule({
  declarations: [
    RouletteComponent,
    StudentComponent,
    WaitComponent,
    SessionComponent,
    FeedbackComponent,
    ReportComponent,
    InstructionVideoComponent,
  ],
  imports: [
    NgbModule,
    Ng5SliderModule,
    CommonModule,
    ReactiveFormsModule,
    RouletteRoutingModule,
    MiscComponentsModule,
  ],
  exports: [StudentComponent],
})
export class RouletteModule {}
