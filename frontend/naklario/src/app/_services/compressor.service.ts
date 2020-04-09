import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class CompressorService {
  constructor() {}

  private cropImage(img: HTMLImageElement, size: number) {
    const aspectRatio = 1;
    // let's store the width and height of our image
    const inputWidth = img.naturalWidth;
    const inputHeight = img.naturalHeight;

    // get the aspect ratio of the input image
    const inputImageAspectRatio = inputWidth / inputHeight;

    // if it's bigger than our target aspect ratio
    let outputWidth = inputWidth;
    let outputHeight = inputHeight;
    if (inputImageAspectRatio > aspectRatio) {
      outputWidth = inputHeight * aspectRatio;
    } else if (inputImageAspectRatio < aspectRatio) {
      outputHeight = inputWidth / aspectRatio;
    }

    // calculate the position to draw the image at
    const outputX = (outputWidth - inputWidth) * 0.5;
    const outputY = (outputHeight - inputHeight) * 0.5;

    // create a canvas that will present the output image
    const tmpImage = document.createElement("canvas");
    // set it to the same size as the image
    tmpImage.width = outputWidth;
    tmpImage.height = outputHeight;

    // draw our image at position 0, 0 on the canvas
    const tmpCtx = tmpImage.getContext("2d");
    tmpCtx.drawImage(img, outputX, outputY);
    // resize

    const outputImage = document.createElement('canvas');
    outputImage.width = size;
    outputImage.height = size;
    const ctx = outputImage.getContext('2d');
    ctx.drawImage(tmpImage, 0, 0, size, size)
    return ctx;
  }

  compress(file: File): Observable<string> {
    const size = 256; // For scaling relative to width

    const reader = new FileReader();
    const obs$ = Observable.create((observer) => {
      reader.onload = (ev) => {
        const img = new Image();
        img.src = (ev.target as any).result;

        (img.onload = () => {
          const ctx = this.cropImage(img, size);
          observer.next(ctx.canvas.toDataURL("image/jpeg", 0.92));
        }),
          (reader.onerror = (error) => observer.error(error));
      };
    });
    reader.readAsDataURL(file);
    return obs$;
  }
}
