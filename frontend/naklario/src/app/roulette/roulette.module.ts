import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { RouletteRoutingModule } from "./roulette-routing.module";
import { ReactiveFormsModule } from "@angular/forms";
import { RouletteComponent } from "./roulette.component";
import { StudentComponent } from "./create/student/student.component";
import { TutorComponent } from "./create/tutor/tutor.component";
import { Ng5SliderModule } from "ng5-slider";
import { RouletteService, DatabaseService } from "../_services";
import { WaitComponent } from "./wait/wait.component";
import { MiscComponentsModule } from "../_misc_components/misc-components.module";
import { SessionComponent } from './session/session.component';
import { FeedbackComponent } from './feedback/feedback.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [
    RouletteComponent,
    StudentComponent,
    TutorComponent,
    WaitComponent,
    SessionComponent,
    FeedbackComponent,
  ],
  imports: [
    NgbModule,
    Ng5SliderModule,
    CommonModule,
    ReactiveFormsModule,
    RouletteRoutingModule,
    MiscComponentsModule,
  ],
})
export class RouletteModule {}
