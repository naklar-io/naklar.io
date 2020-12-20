import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouletteRoutingModule } from './roulette-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { RouletteComponent } from './roulette.component';
import { StudentComponent } from './student/student.component';
import { WaitComponent } from './wait/wait.component';
import { MiscComponentsModule } from '../_misc_components/misc-components.module';
import { SessionComponent } from './session/session.component';
import { FeedbackComponent } from './feedback/feedback.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ReportComponent } from './feedback/report/report.component';
import { InstructionVideoComponent } from './student/instruction-video/instruction-video.component';
import { PauseModalComponent } from './pause-modal/pause-modal.component';
import { NgxSliderModule } from '@m0t0r/ngx-slider';
import { ExitModalComponent } from './session/exit-modal/exit-modal.component';
import { SchedulingModule } from '../scheduling/scheduling.module';

@NgModule({
  declarations: [
    RouletteComponent,
    StudentComponent,
    WaitComponent,
    SessionComponent,
    FeedbackComponent,
    ReportComponent,
    InstructionVideoComponent,
    PauseModalComponent,
    ExitModalComponent,
  ],
  imports: [
    NgbModule,
    NgxSliderModule,
    CommonModule,
    ReactiveFormsModule,
    RouletteRoutingModule,
    MiscComponentsModule,
    SchedulingModule,
  ],
  exports: [StudentComponent],
})
export class RouletteModule {}
