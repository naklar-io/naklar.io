import { Component, Input, OnInit } from '@angular/core';


export type LoaderType = 'glowing-circle' | 'rainbow-circle';

@Component({
  selector: 'app-spinner-loader',
  templateUrl: './spinner-loader.component.html',
  styleUrls: ['./spinner-loader.component.scss']
})
export class SpinnerLoaderComponent implements OnInit {

  @Input() loaderType: LoaderType;

  constructor() { }

  ngOnInit(): void {
  }

}
