import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { PropertyService, Property } from '../../../core/services/property.service';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/auth/auth.service';

const CATEGORIES = [
  { icon: '🏰', label: 'Riads', keywords: ['Riad', 'riad', 'Palais', 'dar', 'Dar'] },
  { icon: '🌊', label: 'Bord de mer', keywords: ['mer', 'Mer', 'océan', 'Agadir', 'Essaouira', 'Tanger'] },
  { icon: '🏔️', label: 'Montagne', keywords: ['Atlas', 'Rif', 'montagne', 'Ourika', 'Chefchaouen'] },
  { icon: '🌴', label: 'Palmeraie', keywords: ['Palmeraie', 'palmeraie', 'bungalow', 'Bungalow'] },
  { icon: '✨', label: 'Design', keywords: ['Design', 'design', 'Moderne', 'moderne', 'Loft', 'loft'] },
  { icon: '🏜️', label: 'Désert', keywords: ['Désert', 'désert', 'Sahara', 'Ouarzazate'] },
  { icon: '🎨', label: 'Artistique', keywords: ['Artiste', 'artiste', 'Artistique', 'Bohème'] },
  { icon: '🌿', label: 'Nature', keywords: ['Éco', 'éco', 'Nature', 'Cabane', 'lodge'] },
];

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
  private propertyService = inject(PropertyService);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // ✅ allProperties EST un signal → computed() réagit correctement
  allProperties = signal<Property[]>([]);
  isLoading = signal(true);
  hasError = signal(false);
  activeCategory = signal<string | null>(null);
  favorites = signal<Set<string>>(new Set());
  categories = CATEGORIES;

  // Calcul réactif : se recalcule quand allProperties OU activeCategory change
  filteredProperties = computed(() => {
    const cat = this.activeCategory();
    const props = this.allProperties();
    if (!cat) return props;
    const catDef = CATEGORIES.find(c => c.label === cat);
    if (!catDef) return props;
    return props.filter(p =>
      catDef.keywords.some(kw =>
        p.title.includes(kw) ||
        (p.description?.includes(kw) ?? false) ||
        p.address.city.includes(kw) ||
        (p.amenities?.some(a => a.includes(kw)) ?? false)
      )
    );
  });

  ngOnInit() {
    this.loadFavorites();

    this.route.queryParams.subscribe(params => {
      const city = params['city'];
      const guests = params['guests'] ? parseInt(params['guests'], 10) : undefined;
      const title = params['title'];
      this.loadProperties(city, guests, title);
    });
  }

  loadProperties(city?: string, guests?: number, title?: string) {
    this.isLoading.set(true);
    this.propertyService.getProperties(city, guests, title).subscribe({
      next: (data) => {
        this.allProperties.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erreur chargement logements:', err);
        this.isLoading.set(false);
        this.hasError.set(true);
      }
    });
  }

  toggleFavorite(event: Event, id: string) {
    event.stopPropagation();
    event.preventDefault();
    if (!this.authService.isAuthenticated()) {
      return;
    }

    const current = new Set(this.favorites());
    const wasFavorite = current.has(id);
    current.has(id) ? current.delete(id) : current.add(id);
    this.favorites.set(current);

    const request$ = wasFavorite
      ? this.userService.unlikeProperty(id)
      : this.userService.likeProperty(id);

    request$.subscribe({
      error: () => {
        const rollback = new Set(this.favorites());
        wasFavorite ? rollback.add(id) : rollback.delete(id);
        this.favorites.set(rollback);
      }
    });
  }

  isFavorite(id: string): boolean { return this.favorites().has(id); }

  setCategory(label: string | null) {
    this.activeCategory.set(this.activeCategory() === label ? null : label);
  }

  goToProperty(id: string) { this.router.navigate(['/properties', id]); }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-MA').format(price);
  }

  private loadFavorites() {
    if (!this.authService.isAuthenticated()) {
      return;
    }

    this.userService.getMyLikes().subscribe({
      next: (likes) => {
        this.favorites.set(new Set(likes.map((like) => like._id)));
      },
      error: () => {
        this.favorites.set(new Set());
      }
    });
  }

  get properties(): Property[] { return this.filteredProperties(); }
}
