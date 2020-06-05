import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { NotifyRoutingModule } from "./notify-routing.module";
import { SettingsComponent } from "./settings/settings.component";
import { ReactiveFormsModule } from "@angular/forms";
import { MultiSelectModule } from "primeng/multiselect";
import { NotificationTimeRangeComponent } from "./settings/notification-time-range.component";

@NgModule({
  declarations: [SettingsComponent, NotificationTimeRangeComponent],
  imports: [
    CommonModule,
    NotifyRoutingModule,
    ReactiveFormsModule,
    MultiSelectModule,
  ],
})
export class NotifyModule {}
