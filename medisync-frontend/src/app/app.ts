import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MascotComponent } from './mascot/mascot.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MascotComponent],
  template: `<router-outlet /><app-mascot />`,
})
export class App {}
