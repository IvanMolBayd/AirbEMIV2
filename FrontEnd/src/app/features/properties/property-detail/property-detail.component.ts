import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PropertyService, Property } from '../../../core/services/property.service';
import { AuthService } from '../../../core/auth/auth.service';
import { UserService, Review, Reservation } from '../../../core/services/user.service';
import confetti from 'canvas-confetti';

@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './property-detail.component.html'
})
export class PropertyDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private propertyService = inject(PropertyService);
  private userService = inject(UserService);
  public authService = inject(AuthService);
  private sanitizer = inject(DomSanitizer);

  readonly Math = Math;

  property = signal<Property | null>(null);
  isLoading = signal(true);
  hasError = signal(false);
  isFavorite = signal(false);

  reviews = signal<any[]>([]);
  averageRating = signal<number>(0);
  hasBooked = signal(false);
  bookedReservationId = signal<string | null>(null);

  // Champs de réservation
  checkInDate = signal<string>('');
  checkOutDate = signal<string>('');
  guestsCount = signal<number>(1);
  bookingError = signal<string | null>(null);

  get numNights(): number {
    if (!this.checkInDate() || !this.checkOutDate()) return 0;
    const d1 = new Date(this.checkInDate());
    const d2 = new Date(this.checkOutDate());
    const diff = Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }

  get subtotal(): number {
    return (this.property()?.pricePerNight || 0) * this.numNights;
  }

  get serviceFee(): number {
    return Math.round(this.subtotal * 0.14);
  }

  get total(): number {
    return this.subtotal + this.serviceFee;
  }

  get canReserve(): boolean {
    return !!this.checkInDate() && !!this.checkOutDate() && this.numNights > 0 && this.guestsCount() >= 1;
  }

  get today(): string {
    return new Date().toISOString().split('T')[0];
  }

  newReview = { rating: 5, comment: '' };

  // Images secondaires fictives pour la galerie
  readonly extraImages = [
    'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&q=80',
    'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&q=80',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&q=80',
  ];

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.router.navigate(['/']); return; }

    this.propertyService.getProperty(id).subscribe({
      next: (data) => {
        this.property.set(data);
        this.loadReviews(id);
        this.checkIfBooked(id);

        // Charger l'état favori
        const favs = JSON.parse(localStorage.getItem('airbemi_favs') || '[]');
        this.isFavorite.set(favs.includes(id));

        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erreur chargement propriété:', err);
        this.isLoading.set(false);
        this.hasError.set(true);
      }
    });
  }

  loadReviews(propertyId: string) {
    this.userService.getReviewsForProperty(propertyId).subscribe(data => {
      this.reviews.set(data);
      if (data.length > 0) {
        const sum = data.reduce((acc, rev) => acc + rev.rating, 0);
        this.averageRating.set(sum / data.length);
      }
    });
  }

  checkIfBooked(propertyId: string) {
    if (!this.authService.isAuthenticated()) return;
    this.userService.getMyTrips().subscribe(trips => {
      const trip = trips.find(t => t.propertyId && (t.propertyId._id === propertyId || (t.propertyId as any) === propertyId));
      if (trip) {
        this.hasBooked.set(true);
        this.bookedReservationId.set(trip._id);
      }
    });
  }

  submitReview() {
    const propId = this.property()?._id;
    const resId = this.bookedReservationId();
    if (!propId || !resId || !this.newReview.comment) return;
    this.userService.createReview({
      propertyId: propId,
      reservationId: resId,
      rating: this.newReview.rating,
      comment: this.newReview.comment
    }).subscribe(() => {
      this.loadReviews(propId);
      this.newReview.comment = '';
    });
  }

  // Pas d'images placeholder — on n'affiche que les vraies images
  get galleryImages(): string[] {
    const prop = this.property();
    if (!prop) return [];

    // Priorité 1 : tableau images[] (upload Multer)
    if (prop.images && prop.images.length > 0) {
      return prop.images;
    }
    // Priorité 2 : imageUrl (ancien champ unique)
    if (prop.imageUrl) {
      return [prop.imageUrl];
    }
    // Aucune image : tableau vide (pas de placeholder)
    return [];
  }

  mapUrl = computed(() => {
    const prop = this.property();
    if (!prop?.location?.coordinates || prop.location.coordinates.length < 2) {
      return this.sanitizer.bypassSecurityTrustResourceUrl('');
    }
    const lng = prop.location.coordinates[0];
    const lat = prop.location.coordinates[1];
    const url = `https://www.openstreetmap.org/export/embed.html?bbox=${lng-0.01},${lat-0.01},${lng+0.01},${lat+0.01}&layer=mapnik&marker=${lat},${lng}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  });

  toggleFavorite() {
    const propId = this.property()?._id;
    if (!propId) return;

    let favs = JSON.parse(localStorage.getItem('airbemi_favs') || '[]');
    if (this.isFavorite()) {
      favs = favs.filter((id: string) => id !== propId);
    } else {
      favs.push(propId);
      confetti({ particleCount: 50, spread: 40, origin: { y: 0.8 } });
    }
    localStorage.setItem('airbemi_favs', JSON.stringify(favs));
    this.isFavorite.set(!this.isFavorite());
  }

  shareProperty() {
    const prop = this.property();
    if (navigator.share && prop) {
      navigator.share({
        title: prop.title,
        text: `Découvrez ${prop.title} sur AirBEMI !`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Lien copié dans le presse-papier !');
    }
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-MA').format(price);
  }

  goBack() {
    this.router.navigate(['/']);
  }

  reserve() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    if (!this.canReserve) {
      this.bookingError.set("Veuillez sélectionner des dates d'arrivée et de départ valides.");
      return;
    }

    const prop = this.property();
    if (!prop) return;

    this.bookingError.set(null);

    this.userService.createReservation({
      propertyId: prop._id,
      checkInDate: new Date(this.checkInDate()).toISOString(),
      checkOutDate: new Date(this.checkOutDate()).toISOString(),
      totalPrice: this.total
    }).subscribe({
      next: () => {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        this.hasBooked.set(true);
        alert(`🎉 Réservation confirmée ! Du ${this.checkInDate()} au ${this.checkOutDate()} — Total: ${this.formatPrice(this.total)} DH`);
        this.checkIfBooked(prop._id);
      },
      error: (err) => {
        // Afficher l'erreur du backend (conflit de dates, etc.)
        const msg = err?.error?.message || "La réservation a échoué. Ces dates sont peut-être déjà réservées.";
        this.bookingError.set(msg);
      }
    });
  }
}
