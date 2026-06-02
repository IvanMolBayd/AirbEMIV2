import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService, Reservation } from '../../core/services/user.service';

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Mes Réservations</h1>
      <p class="text-gray-500 mb-8">Retrouvez ici tous vos voyages passés et à venir.</p>

      <!-- Loading -->
      <div *ngIf="isLoading()" class="space-y-4">
        <div *ngFor="let _ of [1,2,3]" class="animate-pulse flex gap-4 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div class="w-24 h-20 bg-gray-200 rounded-xl shrink-0"></div>
          <div class="flex-1 space-y-3 py-1">
            <div class="h-4 bg-gray-200 rounded w-2/3"></div>
            <div class="h-3 bg-gray-200 rounded w-1/3"></div>
            <div class="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>

      <!-- Vide -->
      <div *ngIf="!isLoading() && reservations().length === 0" class="text-center py-20">
        <span class="text-6xl block mb-4">🧳</span>
        <h2 class="text-2xl font-bold text-gray-700 mb-2">Aucun voyage pour le moment</h2>
        <p class="text-gray-500 mb-6">Votre prochain séjour vous attend !</p>
        <a routerLink="/" class="inline-block bg-brand text-white px-8 py-3 rounded-full font-semibold hover:bg-rose-600 transition">Explorer les logements</a>
      </div>

      <!-- Liste des réservations -->
      <div *ngIf="!isLoading()" class="space-y-4">
        <div *ngFor="let res of reservations()"
          class="flex gap-5 bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition group">

          <!-- Image du logement -->
          <div class="w-28 h-24 rounded-xl overflow-hidden shrink-0 bg-gray-100">
            <img
              [src]="getPropertyImage(res)"
              [alt]="getPropertyTitle(res)"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
          </div>

          <!-- Infos -->
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-2">
              <div>
                <h3 class="font-bold text-gray-900 truncate">{{ getPropertyTitle(res) }}</h3>
                <p class="text-sm text-gray-500">{{ getPropertyCity(res) }}</p>
              </div>
              <!-- Badge statut -->
              <span class="shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold"
                [ngClass]="{
                  'bg-green-100 text-green-700': res.status === 'confirmed',
                  'bg-yellow-100 text-yellow-700': res.status === 'pending',
                  'bg-gray-100 text-gray-500': res.status === 'cancelled'
                }">
                {{ res.status === 'confirmed' ? '✅ Confirmé' : res.status === 'pending' ? '⏳ En attente' : '❌ Annulé' }}
              </span>
            </div>

            <div class="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
              <span>📅 {{ res.checkInDate | date:'dd MMM yyyy' }} → {{ res.checkOutDate | date:'dd MMM yyyy' }}</span>
              <span class="font-semibold text-gray-900">{{ formatPrice(res.totalPrice) }} DH</span>
            </div>

            <a *ngIf="res.propertyId?._id"
              [routerLink]="['/properties', res.propertyId._id]"
              class="inline-block mt-3 text-xs text-brand font-semibold hover:underline">
              Voir le logement →
            </a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ReservationsComponent implements OnInit {
  private userService = inject(UserService);

  reservations = signal<Reservation[]>([]);
  isLoading = signal(true);

  ngOnInit() {
    this.userService.getMyTrips().subscribe({
      next: (data) => {
        this.reservations.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  getPropertyImage(res: Reservation): string {
    const prop = res.propertyId as any;
    return prop?.images?.[0] || prop?.imageUrl || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&q=80';
  }

  getPropertyTitle(res: Reservation): string {
    return (res.propertyId as any)?.title || 'Logement';
  }

  getPropertyCity(res: Reservation): string {
    return (res.propertyId as any)?.address?.city || '';
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-MA').format(price);
  }
}
