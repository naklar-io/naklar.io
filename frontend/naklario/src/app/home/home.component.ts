import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../_services';
import { Router } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  constructor(
    private authenticationService: AuthenticationService,
    private router: Router,
    private meta: Meta,
    private title: Title
  ) {
    this.meta.addTag({
      name: 'description',
      content:
        'Tutoren geben Schülern Nachhilfe',
    });
    this.title.setTitle(
      'naklar.io'
    );
    this.meta.addTag({name: 'keywords', content: 'Nachhilfe'});
  }

  ngOnInit(): void {
    this.authenticationService.isLoggedIn$.pipe(first()).subscribe((isLoggedIn) => {
      if (isLoggedIn) {
        this.router.navigate(['/dashboard']);
      }
    });
  }
}
