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
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MAT_TABS_CONFIG, MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { MdePopoverModule } from '@material-extended/mde';

import { MAT_COLOR_FORMATS, MatColorFormats, NgxMatColorPickerModule } from '@angular-material-components/color-picker';

const matImports = [
  MatToolbarModule, MatFormFieldModule, MatButtonModule, MatInputModule,
  MatIconModule, MatMenuModule, MatProgressSpinnerModule, MatChipsModule,
  MatCheckboxModule, MatButtonToggleModule, MatDialogModule, MatStepperModule,
  MatSelectModule, MatTooltipModule, MatCardModule, MatSnackBarModule, MatTabsModule,
  MatSliderModule, MatRadioModule,

  MdePopoverModule,

  NgxMatColorPickerModule
];

export const CUSTOM_MAT_COLOR_FORMATS: MatColorFormats = {
  display: {
      colorInput: 'hex'
  }
};

@NgModule({
  declarations: [],
  imports: [CommonModule, ...matImports],
  exports: [...matImports],
  providers: [
   { provide: MAT_COLOR_FORMATS, useValue: CUSTOM_MAT_COLOR_FORMATS },
   { provide: MAT_TABS_CONFIG, useValue: { animationDuration: '0ms' } }
  ],
})
export class UIModule { }
