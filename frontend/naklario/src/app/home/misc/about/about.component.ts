import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {

  team = [
    {
      name: "Thomas",
      text: `Einfach geil was wir da mit sehr sehr viel Zeitengagement auf die Beine gestellt haben!💪🏼 Unser Team ist schnell, effizient, professionell, extrem cool drauf und die gemeinsame Arbeit macht sehr viel Spaß. Mal sehen wo das Projekt hingeht, wir haben große Ziele und freuen uns, den Schülern in dieser Zeit kostenlos zu helfen. #gutfürskarma 😝
      Euer Thomas`
    },
    {
      name: "Isabella",
      text: `Gerade in Zeiten wie diesen sollte man das Beste aus allem machen – besonders Schüler*innen sollten meiner Meinung nach keine Gründe zur Verzweiflung haben! Aufgrund dieser Einstellung gehöre ich gerne zum naklar.io Team und finde es schön helfen zu können 💪🏼💡👩🏼‍💻
      Eure Isabella`
    },
    {
      name: "Korbinian",
      text: `Um Daten, Sicherheit und Backend kümmere ich mich als leidenschaftlicher Tüftler bei naklar.io - Gerne mische ich aber auch in allen möglichen Bereichen mit - ob Code oder Konzeptbesprechung! Auf ein starkes Team!
      Euer Korbi :D`
    },
    {
      name: "Max",
      text: `Damit bei naklar.io auch technisch alles passt, bin ich für Frontend📐, UI/UX, Videokonferenzen 🎥 und CI/CD verantwortlich. Unter einen Hut passt das alles natürlich nur mit der tatkräftigen Unterstützung der anderen Teammitglieder🙌🏼!
      Euer Max`
    },
    {
      name: "Sonja",
      text: `Bei naklar.io übernehme ich die Öffentlichkeitsarbeit – und das sehr gerne, weil ich den Gedanken hinter dem Unternehmen befürworte und eine super Idee finde💡niemand sollte unter der derzeitigen Situation zurückbleiben, erst recht keine Schüler die letztendlich für die Zukunft verantwortlich sind. #spreadlove 
      Eure Sonja👩🏼‍💻`
    },
    {
      name: "Sebastian",
      text: `Helfen kann so einfach sein! Ich finde es großartig, dass man so flexibel als Tutor helfen kann. Einfach PC/Handy an und los gehts 🚀. Man verpflichtet sich nicht, kann Schülern aber einfach und direkt helfen! Es ist schön zu sehen welch große Community an Tutoren bereits bei naklar.io mitwirken und Ihren Beitrag während Corona leisten. Das motiviert mich sehr 💪🏼😁🚀
      Euer Sebastian`
    },
    {
      name: "Julius",
      text: `Wenn alles flutscht und die Animationen smooth über den Bildschirm fließen, habe ich wohl mal wieder unzählige Stunden im Programmier-Tunnel verbracht... 😄 Alles, damit Schüler und Tutoren ein angenehmes und reibungsloses Erlebnis auf unserer wunderbaren Plattform haben.
       Euer Julius ❤`
    },
    {
      name: "Vera",
      text: `Ich bastle mit an naklar.io. Dabei unterstütze ich die Jungs von der Technik 👩🏼‍💻 bei der Frontend-Entwicklung und feile mit dem ganzen Team an neuen kreativen Ideen, um für Fragen ❓von Schülern schnelle Antworten💡zu finden.
      Eure Vera 🙂`
    },
    {
      name: "Julian",
      text: `Ein bisschen was geht immer! Auch wenn man kein Genie ist, reicht das eigene Wissen häufig aus um anderen zu helfen. Darum helfe ich auch bei naklar.io gerne mit!💡
      Euer Julian 😄`
    },
  ]

  activeMemberPicture = -1

  joinMailToLink = `mailto:info@naklar.io?subject=Verst%C3%A4rkung%20f%C3%BCr's%20Team%20naklar.io&body=Liebes%20naklar.io-Team%2C%0D%0A%0D%0Agerne%20w%C3%BCrde%20ich%20euch%20unterst%C3%BCtzen.%20Kurz%20zu%20mir%3A%0D%0A-%20Zeitengagement%20pro%20Woche%20in%20Stunden%3A%0D%0A-%20Meine%20St%C3%A4rken%3A%0D%0A-%20Meine%20Motivation%3A%0D%0A-%20Meine%20Handynummer%3A%0D%0A-%20Mein%20Name%3A%0D%0AIch%20freue%20mich%20%C3%BCber%20eine%20Kontaktaufnahme%20per%20Telefon.%0D%0A%0D%0AViele%20Gr%C3%BC%C3%9Fe`

  constructor() { }

  ngOnInit(): void {
  }

}
