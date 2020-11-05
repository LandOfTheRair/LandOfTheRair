import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';

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
import { MatStepperModule } from '@angular/material/stepper';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { MdePopoverModule } from '@material-extended/mde';

import { AlertComponent } from './_shared/components/alert/alert.component';
import { ButtonCloseComponent } from './_shared/components/button-close.component';
import { ButtonMinimizeComponent } from './_shared/components/button-minimize.component';
import { IconComponent } from './_shared/components/icon.component';
import { WindowComponent } from './_shared/components/window.component';
import { DraggableDirective } from './_shared/directives/dragdrop/draggable.directive';
import { DroppableDirective } from './_shared/directives/dragdrop/droppable.directive';
import { DraggableDirective as DraggableWindowDirective } from './_shared/directives/draggable-window.directive';
import { LinkifyPipe } from './_shared/pipes/linkify.pipe';

const matImports = [
  MatToolbarModule, MatFormFieldModule, MatButtonModule, MatInputModule,
  MatIconModule, MatMenuModule, MatProgressSpinnerModule, MatChipsModule,
  MatCheckboxModule, MatButtonToggleModule, MatDialogModule, MatStepperModule,
  MatSelectModule, MatTooltipModule, MatCardModule,

  MdePopoverModule
];

const declarations = [
  AlertComponent, DraggableWindowDirective, ButtonCloseComponent, ButtonMinimizeComponent, IconComponent, WindowComponent, LinkifyPipe,
  DraggableDirective, DroppableDirective
];


@NgModule({
  declarations: [...declarations],
  imports: [CommonModule, ...matImports],
  exports: [...matImports, ...declarations]
})
export class SharedModule { }
