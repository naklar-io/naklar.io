import { Component, OnInit, Output, EventEmitter, Input } from "@angular/core";
import { CompressorService } from "src/app/_services";
import { HttpClient } from "@angular/common/http";

@Component({
  selector: "misc-img-upload",
  templateUrl: "./img-upload.component.html",
  styleUrls: ["./img-upload.component.scss"],
  providers: [CompressorService],
})
export class ImgUploadComponent implements OnInit {
  @Output() img = new EventEmitter<string>();
  img_file: string;
  @Input() existingURL;

  constructor(
    private compressorService: CompressorService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.img_file = "assets/img/icons/user_default.png";
    if (this.existingURL) {
      this.img_file = this.existingURL;
    }
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
