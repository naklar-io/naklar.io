import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { RouletteRoutingModule } from "./roulette-routing.module";
import { ReactiveFormsModule } from "@angular/forms";
import { RouletteComponent } from "./roulette.component";
import { StudentComponent } from "./create/student/student.component";
import { TutorComponent } from "./create/tutor/tutor.component";
import { Ng5SliderModule } from "ng5-slider";
import { WaitingComponent } from "./wait/waiting.component";
import { FeedbackComponent } from "./feedback/feedback.component";
import { RouletteService, DatabaseService } from "../_services";
import { TutorWaitComponent } from './wait/tutor-wait/tutor-wait.component';
import { StudentWaitComponent } from './wait/student-wait/student-wait.component';

@NgModule({
  declarations: [
    RouletteComponent,
    StudentComponent,
    TutorComponent,
    WaitingComponent,
    FeedbackComponent,
    TutorWaitComponent,
    StudentWaitComponent,
  ],
  imports: [
    Ng5SliderModule,
    CommonModule,
    ReactiveFormsModule,
    RouletteRoutingModule,
  ],
})
export class RouletteModule {}
