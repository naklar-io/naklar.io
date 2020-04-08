import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { CompressorService } from "src/app/_services";

@Component({
  selector: "misc-img-upload",
  templateUrl: "./img-upload.component.html",
  styleUrls: ["./img-upload.component.scss"],
  providers: [CompressorService],
})
export class ImgUploadComponent implements OnInit {
  img: string;
  constructor(private compressorService: CompressorService) {}

  ngOnInit(): void {
    this.img = "assets/img/icons/user_default.png";
  }

  processImg(event) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0] as File;
      this.compressorService.compress(file).subscribe((data) => {
        console.log(data);
        this.img = data;
      });
    }
  }
}
