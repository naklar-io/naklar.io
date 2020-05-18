import { Component, OnInit } from '@angular/core';

interface Feature {
  svgPathD: string,
  displayText: string,
  longDescription: string,
  shortDescription: string
}

const features: Feature[] = [
  {
    svgPathD: 'M2.678 11.894a1 1 0 01.287.801 10.97 10.97 0 01-.398 2c1.395-.323 2.247-.697 2.634-.893a1 1 0 01.71-.074A8.06 8.06 0 008 14c3.996 0 7-2.807 7-6 0-3.192-3.004-6-7-6S1 4.808 1 8c0 1.468.617 2.83 1.678 3.894zm-.493 3.905a21.682 21.682 0 01-.713.129c-.2.032-.352-.176-.273-.362a9.68 9.68 0 00.244-.637l.003-.01c.248-.72.45-1.548.524-2.319C.743 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7-3.582 7-8 7a9.06 9.06 0 01-2.347-.306c-.52.263-1.639.742-3.468 1.105z',
    displayText: 'Fragen auf Knopfdruck',
    longDescription: 'Eine Vielzahl an engagierten Tutoren steht jederzeit für Dich auf Knopfdruck zur Verfügung. Probiere es gleich aus und stelle Deine Frage!',
    shortDescription: 'Stell deine Frage per Chat, Audio oder Video direkt an Tutoren aus ganz Deutschland.'
  },
  {
    svgPathD: 'M1 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H1zm5-6a3 3 0 100-6 3 3 0 000 6zm9.854-2.854a.5.5 0 010 .708l-3 3a.5.5 0 01-.708 0l-1.5-1.5a.5.5 0 01.708-.708L12.5 7.793l2.646-2.647a.5.5 0 01.708 0z',
    displayText: 'Geprüfte Tutoren',
    longDescription: 'Sicherheit und Vertrauen sind wichtig. Unsere Tutoren werden einzeln überprüft und mithilfe eines Bewertungssystems kontrolliert.',
    shortDescription: 'Um für mehr Sicherheit und Vertrauen zu sorgen, werden Tutoren persönlich verifiziert. '
  },
  {
    svgPathD: 'M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1h8zm-7.995-.944v-.002.002zM7.022 13h7.956a.274.274 0 00.014-.002l.008-.002c-.002-.264-.167-1.03-.76-1.72C13.688 10.629 12.718 10 11 10c-1.717 0-2.687.63-3.24 1.276-.593.69-.759 1.457-.76 1.72a1.05 1.05 0 00.022.004zm7.973.056v-.002.002zM11 7a2 2 0 100-4 2 2 0 000 4zm3-2a3 3 0 11-6 0 3 3 0 016 0zM6.936 9.28a5.88 5.88 0 00-1.23-.247A7.35 7.35 0 005 9c-4 0-5 3-5 4 0 .667.333 1 1 1h4.216A2.238 2.238 0 015 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816zM4.92 10c-1.668.02-2.615.64-3.16 1.276C1.163 11.97 1 12.739 1 13h3c0-1.045.323-2.086.92-3zM1.5 5.5a3 3 0 116 0 3 3 0 01-6 0zm3-2a2 2 0 100 4 2 2 0 000-4z',
    displayText: 'Für jeden zugänglich',
    longDescription: 'Jeder kann helfen. Und helfen kann so einfach sein! Engagierte können ganz einfach Tutor werden und in ihren verfügbaren Zeiten flexibel Schülern helfen. Der kostenlose Zugang ermöglicht Schülerinnen und Schülern per Knopfdruck auf Tutoren zuzugreifen und bequem ihre Fragen zu stellen.',
    shortDescription: 'Für mehr Bildungsgerechtigkeit: Kostenlos Fragen stellen - flexibel und einfach helfen.'
  }
]

@Component({
  selector: 'home-more-information-features',
  templateUrl: './features.component.html',
  styleUrls: ['./features.component.scss']
})
export class FeaturesComponent implements OnInit {
  features = features

  constructor() { }

  ngOnInit(): void {
  }

}
