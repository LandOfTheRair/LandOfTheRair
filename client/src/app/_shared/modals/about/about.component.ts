import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
})
export class AboutComponent {
  public get version() {
    return environment.version;
  }

  constructor(public dialogRef: MatDialogRef<AboutComponent>) {}
}
