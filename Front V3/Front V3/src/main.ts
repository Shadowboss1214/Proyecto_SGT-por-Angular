import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

/**
 * Application entry point.
 * Bootstraps the root `App` component using the provided `appConfig`,
 * which registers the router, HTTP client, and authentication interceptor.
 * Any fatal initialization error is logged to the console.
 */

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
