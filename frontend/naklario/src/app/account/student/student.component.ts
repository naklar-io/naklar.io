import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-student',
  templateUrl: './student.component.html',
  styleUrls: ['./student.component.scss']
})
export class StudentComponent implements OnInit {
  registerUrl = '/account/student/register';

  constructor() { }

  ngOnInit(): void {
  }

}
