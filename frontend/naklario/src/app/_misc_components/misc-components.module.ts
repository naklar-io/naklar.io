import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { UserCardComponent } from "./user-card/user-card.component";
import { ToastsComponent } from "./toasts/toasts.component";
import { ImgUploadComponent } from "./img-upload/img-upload.component";
import { SafePipe } from "./safe.pipe";

@NgModule({
  declarations: [
    ImgUploadComponent,
    ToastsComponent,
    UserCardComponent,
    SafePipe,
  ],
  imports: [CommonModule, NgbModule],
  exports: [ImgUploadComponent, ToastsComponent, UserCardComponent, SafePipe],
})
export class MiscComponentsModule {}
