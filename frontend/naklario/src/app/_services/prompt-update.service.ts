import { Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class PromptUpdateService {
  constructor(updates: SwUpdate, private snackBar: MatSnackBar) {
    updates.available.subscribe((event) => {
      this.snackBar
        .open('Eine neue Version der Seite ist verfügbar', 'Aktualisieren')
        .onAction()
        .subscribe((action) => {
          updates.activateUpdate().then(() => document.location.reload());
        });
    });
  }
}
