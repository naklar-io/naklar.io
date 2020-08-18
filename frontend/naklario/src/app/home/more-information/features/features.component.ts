import { Component, OnInit } from '@angular/core';

interface Feature {
  src: string,
  displayText: string,
  longDescription: string,
  shortDescription: string
}

const features: Feature[] = [
  {
    src: 'assets/img/features/aufdenpunkt.svg',
    displayText: 'Fragen auf Knopfdruck',
    longDescription: 'Eine Vielzahl an engagierten Tutoren steht jederzeit für Dich auf Knopfdruck zur Verfügung. Probiere es gleich aus und stelle Deine Frage!',
    shortDescription: 'Stell deine Frage per Chat, Audio oder Video direkt an Tutoren aus ganz Deutschland.'
  },
  {
    src: 'assets/img/features/geprueft.svg',
    displayText: 'Geprüfte Tutoren',
    longDescription: 'Sicherheit und Vertrauen sind wichtig. Unsere Tutoren werden einzeln überprüft und mithilfe eines Bewertungssystems kontrolliert.',
    shortDescription: 'Um für mehr Sicherheit und Vertrauen zu sorgen, werden Tutoren persönlich verifiziert. '
  },
  {
    src: 'assets/img/features/offen.svg',
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
