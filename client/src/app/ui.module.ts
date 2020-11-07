import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { MdePopoverModule } from '@material-extended/mde';

const matImports = [
  MatToolbarModule, MatFormFieldModule, MatButtonModule, MatInputModule,
  MatIconModule, MatMenuModule, MatProgressSpinnerModule, MatChipsModule,
  MatCheckboxModule, MatButtonToggleModule, MatDialogModule, MatStepperModule,
  MatSelectModule, MatTooltipModule, MatCardModule, MatSnackBarModule,

  MdePopoverModule
];

@NgModule({
  declarations: [],
  imports: [CommonModule, ...matImports],
  exports: [...matImports]
})
export class UIModule { }
