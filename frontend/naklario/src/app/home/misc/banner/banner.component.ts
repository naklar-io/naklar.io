import { Component, OnInit } from "@angular/core";
import { AuthenticationService } from "src/app/_services";

type BannerType = "error" | "warning" | "info";
interface BannerMessage {
  type: BannerType;
  content: string;
}

@Component({
  selector: "app-banner",
  templateUrl: "./banner.component.html",
  styleUrls: ["./banner.component.scss"],
})
export class BannerComponent implements OnInit {
  messages: BannerMessage[] = []; 

  constructor(private authenticationsService: AuthenticationService) {}

  ngOnInit(): void {
    if (this.authenticationsService.isLoggedIn) {
      this.messages = [
        {
          type: "error",
          content:
            "BANNER-ERROR: Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
        },
        {
          type: "warning",
          content:
            "BANNER-WARNING: Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
        },
        {
          type: "info",
          content:
            "BANNER-INFO Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
        },
      ];
    } 
  }

  getClass(type: BannerType): string {
    switch (type) {
      case "error":
        return "banner-error bg-danger text-light";
      case "warning":
        return "banner-warning bg-warning ";
      case "info":
        return "banner-info bg-primary text-light";
    }
  }
}
