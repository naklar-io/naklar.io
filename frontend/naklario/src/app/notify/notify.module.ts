import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { NotifyRoutingModule } from "./notify-routing.module";
import { SettingsComponent } from "./settings/settings.component";
import { ReactiveFormsModule } from "@angular/forms";
import { NotificationTimeRangeComponent } from "./settings/notification-time-range.component";
import {MatSelectModule} from '@angular/material/select'; 

@NgModule({
  declarations: [SettingsComponent, NotificationTimeRangeComponent],
  imports: [
    CommonModule,
    NotifyRoutingModule,
    ReactiveFormsModule,
    MatSelectModule,
  ],
})
export class NotifyModule {}
