import { Component, OnInit } from '@angular/core';

interface Feature {
  src: string;
  displayText: string;
  longDescription: string;
  shortDescription: string;
}

const features: Feature[] = [
  {
    src: 'assets/img/features/aufdenpunkt.svg',
    displayText: 'Fragen auf Knopfdruck',
    longDescription: 'Eine Vielzahl an engagierten Tutoren steht für Dich auf Knopfdruck zur Verfügung. Gib einfach deinen Code ein und stelle deine Fragen!',
    shortDescription: 'Stell deine Frage per Chat, Audio oder Video direkt an Tutoren aus ganz Deutschland.'
  },
  {
    src: 'assets/img/features/geprueft.svg',
    displayText: 'Geprüfte Tutoren',
    longDescription: 'Sicherheit und Vertrauen sind wichtig. Unsere Tutoren werden einzeln überprüft und mithilfe eines Bewertungssystems kontrolliert.',
    shortDescription: 'Um für mehr Sicherheit und Vertrauen zu sorgen, werden Tutoren persönlich verifiziert. '
  }
];

@Component({
  selector: 'home-more-information-features',
  templateUrl: './features.component.html',
  styleUrls: ['./features.component.scss']
})
export class FeaturesComponent implements OnInit {
  features = features;

  constructor() { }

  ngOnInit(): void {
  }

}
