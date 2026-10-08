import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppShell } from './layout/app-shell.component';

@Component({
  imports: [RouterOutlet, AppShell],
  selector: 'app-root',
  template: '<app-shell><router-outlet /></app-shell>',
})
export class App {
}
