import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * Root component of the application.
 * Acts as the entry point for the Angular component tree,
 * rendering the top-level `<router-outlet>` where all feature
 * components are dynamically loaded based on the active route.
 */

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Front');
}
