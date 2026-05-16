import { Component, ElementRef, HostListener, inject, signal } from '@angular/core';
import { NavigationService } from '../../../core/services/nav.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-top-menu',
  imports: [],
  templateUrl: './top-menu.html',
  styleUrl: './top-menu.css',
})
export class TopMenu {
  private authService = inject(AuthService);
  private router = inject(NavigationService);
  private elementRef = inject(ElementRef);

  isMenuOpen = signal(false);

  toggleMenu() {
    this.isMenuOpen.set(!this.isMenuOpen());
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const clickedInside = this.elementRef.nativeElement.contains(event.target as Node);
    if (!clickedInside) {
      this.isMenuOpen.set(false);
    }
  }

  logout() {
    this.authService.logout();
    localStorage.removeItem('role')
    this.router.navigate(['/login']);
  }
}
