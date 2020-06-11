import { Component, Input, OnInit } from '@angular/core'

@Component({
  selector: 'app-social-icons',
  templateUrl: './social-icons.component.html',
  styleUrls: ['./social-icons.component.scss']
})
export class SocialIconsComponent implements OnInit {
  @Input() aClasses: string

  socialLinks = [
    {
      platform: 'tiktok',
      link: 'https://www.tiktok.com/@naklar.io'
    },
    {
      platform: 'instagram',
      link: 'https://www.instagram.com/naklar.io'
    },
    {
      platform: 'twitter',
      link: 'https://twitter.com/IoNaklar'
    },
    {
      platform: 'facebook',
      link: 'https://www.facebook.com/naklario'
    },
  ]

  constructor() { }

  ngOnInit(): void {
  }

}
