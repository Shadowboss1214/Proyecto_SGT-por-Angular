import { Component, ElementRef, HostListener, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationService } from '../../../core/services/nav.service';
import { AuthService } from '../../../core/services/auth.service';

/**
 * Top navigation menu component with a toggleable dropdown.
 * Handles user logout and closes the menu automatically
 * when the user clicks outside the component.
 */

@Component({
  selector: 'app-top-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './top-menu.html',
  styleUrl: './top-menu.css',
})
export class TopMenu {
  /** Service used to clear the session and remove stored tokens */
  private authService = inject(AuthService);

  /** Role-aware navigation service for redirecting after logout */
  private router = inject(NavigationService);

  /** Reference to the component's host DOM element, used for outside-click detection */
  private elementRef = inject(ElementRef);

  /**
   * Reactive signal that tracks whether the dropdown menu is open or closed.
   * Defaults to `false` (closed).
   */
  isMenuOpen = signal(false);

  get username(): string {
    return localStorage.getItem('role') === 'ADMIN'
      ? (this.authService.getTokenPayload()?.sub ?? localStorage.getItem('username') ?? 'Admin')
      : (this.authService.getTokenPayload()?.sub ?? 'Conductor');
  }

  get role(): string {
    return localStorage.getItem('role') ?? '';
  }

  get roleLabel(): string {
    const r = this.role;
    if (r === 'ADMIN')   return 'Administrador';
    if (r === 'CHOUFER') return 'Conductor';
    return r;
  }

  get badgeClass(): string {
    return this.role === 'ADMIN' ? 'badge badge--admin' : 'badge badge--driver';
  }

  toggleMenu() { this.isMenuOpen.set(!this.isMenuOpen()); }

  /**
   * Listens for click events on the entire document.
   * Closes the dropdown menu if the click occurred outside the component's host element.
   *
   * @param event - The native MouseEvent from the document click listener
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.isMenuOpen.set(false);
    }
  }

  /**
   * Logs the user out of the application.
   * Clears the access token via `AuthService`, removes the stored role
   * from `localStorage`, and redirects to the login page.
   */
  logout() {
    this.authService.logout();
    localStorage.removeItem('role');
    this.router.navigate(['/login']);
  }
}
