import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { UserCardComponent } from "./user-card/user-card.component";
import { ToastsComponent } from "./toasts/toasts.component";
import { ImgUploadComponent } from "./img-upload/img-upload.component";




@NgModule({
  declarations: [
    ImgUploadComponent,
    ToastsComponent,
    UserCardComponent,
  ],
  imports: [CommonModule, NgbModule],
  exports: [
    ImgUploadComponent,
    ToastsComponent,
    UserCardComponent,
  ],
})
export class MiscComponentsModule {}
