import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './navbar.component.html'
})
export class NavbarComponent {
  private router = inject(Router);
  public authService = inject(AuthService);
  isSearchOpen = false;
  searchCity = '';
  searchTitle = '';
  searchGuests: number | null = null;

  logout() {
    this.authService.logout();
  }

  toggleSearch() {
    this.isSearchOpen = !this.isSearchOpen;
  }

  closeSearch() {
    this.isSearchOpen = false;
  }

  onSearch() {
    const queryParams: any = {};
    if (this.searchCity) queryParams.city = this.searchCity;
    if (this.searchTitle) queryParams.title = this.searchTitle;
    if (this.searchGuests) queryParams.guests = this.searchGuests;

    this.router.navigate(['/'], { queryParams });
    this.isSearchOpen = false;
  }
}
