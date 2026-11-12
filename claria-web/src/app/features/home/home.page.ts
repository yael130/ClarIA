import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Panel de inicio con bienvenida, ruta formativa y reto del día. */
@Component({
  imports: [RouterLink],
  templateUrl: './home.page.html',
})
export class HomePage {}
