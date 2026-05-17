import { Component, ElementRef, HostListener, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationService } from '../../../core/services/nav.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-top-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './top-menu.html',
  styleUrl: './top-menu.css',
})
export class TopMenu {
  private authService = inject(AuthService);
  private router      = inject(NavigationService);
  private elementRef  = inject(ElementRef);

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

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.isMenuOpen.set(false);
    }
  }

  logout() {
    this.authService.logout();
    localStorage.removeItem('role');
    this.router.navigate(['/login']);
  }
}
