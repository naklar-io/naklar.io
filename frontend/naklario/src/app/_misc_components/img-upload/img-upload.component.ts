import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { CompressorService } from "src/app/_services";

@Component({
  selector: "misc-img-upload",
  templateUrl: "./img-upload.component.html",
  styleUrls: ["./img-upload.component.scss"],
  providers: [CompressorService],
})
export class ImgUploadComponent implements OnInit {
  @Output() img = new EventEmitter<string>();
  img_file: string;

  constructor(private compressorService: CompressorService) {}

  ngOnInit(): void {
    this.img_file = "assets/img/icons/user_default.png";
  }

  processImg(event) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0] as File;
      this.compressorService.compress(file).subscribe((data) => {
        this.img_file = data;
        this.img.emit(data);
      });
    }
  }
}
