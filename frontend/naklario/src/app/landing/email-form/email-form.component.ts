import { Component, OnInit } from "@angular/core";
import { EmailModel } from "./email-model";
import { EmailFormService } from "./email-form.service";

@Component({
  selector: "app-email-form",
  templateUrl: "./email-form.component.html",
  styleUrls: ["./email-form.component.scss"],
  providers: [EmailFormService]
})
export class EmailFormComponent implements OnInit {
  ind_types = [
    { abbr: "ST", full: "Student*in" },
    { abbr: "TU", full: "Tutor*in" },
    { abbr: "PA", full: "Elternteil" }
  ];

  model = new EmailModel("", "", false);

  submitted = false;

  constructor(private emailFormService: EmailFormService) {}

  onSubmit() {
    this.emailFormService.postForm(this.model).subscribe(
      newForm => {
        this.submitted = true;
      },
    );
  }

  ngOnInit(): void {}
}

