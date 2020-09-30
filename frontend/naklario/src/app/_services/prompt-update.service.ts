import { Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { MatSnackBar } from '@angular/material/snack-bar';
import { interval } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PromptUpdateService {
  constructor(private updates: SwUpdate, private snackBar: MatSnackBar) {
    if (updates.isEnabled) {
      interval(6 * 60 * 60).subscribe(() => updates.checkForUpdate()
        .then(() => console.log('checking for updates')));
    }
  }

  public checkForUpdates(): void {
    this.updates.available.subscribe((event) => {
      const snack = this.snackBar
        .open('Eine neue Version der Seite ist verfügbar', 'Aktualisieren', {
          horizontalPosition: 'center',
          verticalPosition: 'top'
        })
        .onAction()
        .subscribe((action) => {
          this.updates.activateUpdate().then(() => document.location.reload());
        });
    });
  }
}
