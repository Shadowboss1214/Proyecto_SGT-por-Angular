import { Injectable } from '@angular/core';
import { PathLocationStrategy } from '@angular/common';

/**
 * Custom location strategy that keeps the browser URL fixed at `/Bus.inc.com`
 * while tracking the actual internal route in memory and `sessionStorage`.
 *
 * This prevents 404 errors on page refresh in environments where the server
 * is not configured to redirect all routes to `index.html`, by ensuring the
 * browser always requests the same base URL regardless of the Angular route.
 *
 * @remarks
 * Extends Angular's `PathLocationStrategy` and overrides `path()`,
 * `pushState()`, and `replaceState()` to intercept all navigation events.
 */

@Injectable()
export class FixedLocationStrategy extends PathLocationStrategy {

/**
 * Custom location strategy that keeps the browser URL fixed at `/Bus.inc.com`
 * while tracking the actual internal route in memory and `sessionStorage`.
 *
 * This prevents 404 errors on page refresh in environments where the server
 * is not configured to redirect all routes to `index.html`, by ensuring the
 * browser always requests the same base URL regardless of the Angular route.
 *
 * @remarks
 * Extends Angular's `PathLocationStrategy` and overrides `path()`,
 * `pushState()`, and `replaceState()` to intercept all navigation events.
 */
  private internalUrl: string = (() => {
    const real = window.location.pathname;
    return real && real !== '/' ? real : '/Bus.inc.com';
  })();

   /**
   * Returns the current internal route as seen by the Angular Router.
   * Always returns the in-memory `internalUrl` instead of the actual browser URL.
   *
   * @returns The current internal route string
   */
  override path(): string {
    return this.internalUrl;
  }

  /**
   * Intercepts Angular's push navigation events.
   * Stores the real route in memory and `sessionStorage`, but pushes
   * the fixed base URL (`/Bus.inc.com`) to the browser history to prevent 404s.
   *
   * @param state       - Arbitrary state object associated with the history entry
   * @param title       - Title for the history entry (ignored by most browsers)
   * @param url         - The actual Angular route to store internally
   * @param queryParams - Query parameter string to append to the URL
   */
  override pushState(state: any, title: string, url: string, queryParams: string): void {
    this.internalUrl = url;
    sessionStorage.setItem('last_route', url);
    super.pushState(state, title, '/Bus.inc.com', '');
  }

    /**
   * Intercepts Angular's replace navigation events.
   * Stores the real route in memory and `sessionStorage`, but replaces
   * the current browser history entry with the fixed base URL (`/Bus.inc.com`).
   *
   * @param state       - Arbitrary state object associated with the history entry
   * @param title       - Title for the history entry (ignored by most browsers)
   * @param url         - The actual Angular route to store internally
   * @param queryParams - Query parameter string to append to the URL
   */
  override replaceState(state: any, title: string, url: string, queryParams: string): void {
    this.internalUrl = url;
    sessionStorage.setItem('last_route', url);
    super.replaceState(state, title, '/Bus.inc.com', '');
  }
}
