import { Component, OnInit } from '@angular/core';
import { kgV } from '../../../_helpers'

interface PartnerLogo {
  href: string,
  src: string,
  alt: string
}


const partnerLogos: PartnerLogo[] = [
  {
    href: 'https://www.kaenguru-online.de/',
    src: 'assets/img/partners/01 kanguru.png',
    alt: 'Känguru - Stadtmagazin Köln-Bonn'
  },
  {
    href: 'https://km-bw.de',
    src: 'assets/img/partners/02 km.png',
    alt: 'Kultusministerium Baden-Württemberg'
  },
  {
    href: 'https://www.tum.de/',
    src: 'assets/img/partners/03 tum.png',
    alt: 'TUM Logo'
  },
  {
    href: 'https://wirvsvirushackathon.org',
    src: 'assets/img/partners/04 wvsv.png',
    alt: 'Hackathon WirVsVirus Logo'
  },
  {
    href: 'https://lev-gym-bayern.de/node/2921',
    src: 'assets/img/partners/05 lev_b.png',
    alt: 'TUM Logo'
  },
  {
    href: 'https://www.manageandmore.de',
    src: 'assets/img/partners/06 mam.png',
    alt: 'TUM Manage and More Logo'
  },
  {
    href: 'https://tatkraeftig.org/projekt/ehrenamtliche-tutorinnen-fuer-schuelerinnen-im-homeschooling-gesucht/',
    src: 'assets/img/partners/07 tatkraeftig.png',
    alt: 'Tatkräftig e.V.'
  },
  {
    href: 'https://www.pi-muenchen.de/',
    src: 'assets/img/partners/08 pi.png',
    alt: 'Pädagogisches Institut München'
  }
]

@Component({
  selector: 'home-more-information-partners',
  templateUrl: './partners.component.html',
  styleUrls: ['./partners.component.scss']
})
export class PartnersComponent implements OnInit {
  partnerGroupsMobile: PartnerLogo[][] = []
  partnerGroupsDesktop: PartnerLogo[][] = []
  mobilePageSize = 2
  desktopPageSize = 4

  carouselChangeInterval = 4000

  constructor() { }

  ngOnInit(): void {
    this.partnerGroupsDesktop = this.calculateItems(partnerLogos, this.desktopPageSize)
    this.partnerGroupsMobile = this.calculateItems(partnerLogos, this.mobilePageSize)
  }

  calculateItems<T>(array: T[], pageSize): T[][] {
    const mustItemCount = kgV(array.length, pageSize)
    // console.log(mustItemCount)
    const pagesCount = mustItemCount / pageSize
    // console.log(pagesCount)

    const returnArray: T[][] = []

    for (let page = 0; page < pagesCount; page++) {
      const itemId = page * pageSize
      const startIndex = itemId % array.length
      const pageArray: T[] = []

      for (let i = 0; i < pageSize; i++) {
        const index = (startIndex + i) % array.length
        pageArray.push(array[index])
      }
      returnArray.push(pageArray)
    }

    return returnArray
  }

}
