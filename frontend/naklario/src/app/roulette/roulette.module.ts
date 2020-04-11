import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { RouletteRoutingModule } from "./roulette-routing.module";
import { ReactiveFormsModule } from "@angular/forms";
import { RouletteComponent } from "./roulette.component";
import { StudentComponent } from "./student/student.component";
import { TutorComponent } from "./tutor/tutor.component";
import { Ng5SliderModule } from "ng5-slider";
import { WaitingComponent } from "./waiting/waiting.component";
import { FeedbackComponent } from "./feedback/feedback.component";
import { RouletteService } from "../_services";

@NgModule({
  declarations: [
    RouletteComponent,
    StudentComponent,
    TutorComponent,
    WaitingComponent,
    FeedbackComponent,
  ],
  imports: [
    Ng5SliderModule,
    CommonModule,
    ReactiveFormsModule,
    RouletteRoutingModule,
  ],
  providers: [RouletteService],
})
export class RouletteModule {}
