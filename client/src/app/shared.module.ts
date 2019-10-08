import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialogModule } from '@angular/material/dialog';
import { MatStepperModule } from '@angular/material/stepper';

import { DraggableDirective } from './_shared/directives/draggable.directive';
import { ButtonCloseComponent } from './_shared/components/button-close.component';
import { ButtonMinimizeComponent } from './_shared/components/button-minimize.component';
import { IconComponent } from './_shared/components/icon.component';
import { WindowComponent } from './_shared/components/window.component';
import { LinkifyPipe } from './_shared/pipes/linkify.pipe';

const matImports = [
  MatToolbarModule, MatFormFieldModule, MatButtonModule, MatInputModule,
  MatIconModule, MatMenuModule, MatProgressSpinnerModule, MatChipsModule,
  MatCheckboxModule, MatButtonToggleModule, MatDialogModule, MatStepperModule
];

const declarations = [
  DraggableDirective, ButtonCloseComponent, ButtonMinimizeComponent, IconComponent, WindowComponent, LinkifyPipe
];


@NgModule({
  declarations: [...declarations],
  imports: [CommonModule, ...matImports],
  exports: [...matImports, ...declarations]
})
export class SharedModule { }
