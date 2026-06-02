import { Component, inject, signal, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PropertyService } from '../../../core/services/property.service';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/auth/auth.service';
import * as L from 'leaflet';
import confetti from 'canvas-confetti';

@Component({
  selector: 'app-create-property',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './create-property.component.html'
})
export class CreatePropertyComponent implements AfterViewInit {
  private fb = inject(FormBuilder);
  private propertyService = inject(PropertyService);
  private router = inject(Router);
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  isLoading = signal(false);
  isUploadingImage = signal(false);
  errorMessage: string | null = null;
  uploadedImageUrls: string[] = [];
  imagePreviewUrls: string[] = [];

  private map!: L.Map;
  private marker!: L.Marker;
  selectedLocation: { lat: number; lng: number } | null = null;

  propertyForm = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(5)]],
    description: ['', [Validators.required, Validators.minLength(20)]],
    pricePerNight: [null as number | null, [Validators.required, Validators.min(1)]],
    maxGuests: [null as number | null, [Validators.required, Validators.min(1)]],
    city: ['', Validators.required],
    country: ['', Validators.required],
    amenities: this.fb.group({
      wifi: [false],
      piscine: [false],
      parking: [false],
      climatisation: [false],
      cuisine: [false],
      tv: [false]
    }),
  });

  ngAfterViewInit() {
    this.initMap();
  }

  private initMap() {
    this.map = L.map('map').setView([31.79, -7.09], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    const iconDefault = L.icon({
      iconRetinaUrl: 'assets/marker-icon-2x.png',
      iconUrl: 'assets/marker-icon.png',
      shadowUrl: 'assets/marker-shadow.png',
      iconSize: [25, 41], iconAnchor: [12, 41],
      popupAnchor: [1, -34], tooltipAnchor: [16, -28], shadowSize: [41, 41]
    });
    L.Marker.prototype.options.icon = iconDefault;

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.selectedLocation = { lat: e.latlng.lat, lng: e.latlng.lng };
      if (this.marker) {
        this.marker.setLatLng(e.latlng);
      } else {
        this.marker = L.marker(e.latlng).addTo(this.map);
      }
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];

    // Prévisualisation locale immédiate
    const reader = new FileReader();
    reader.onload = (e) => {
      this.imagePreviewUrls = [...this.imagePreviewUrls, e.target?.result as string];
    };
    reader.readAsDataURL(file);

    // Upload vers le backend
    // IMPORTANT : ne PAS définir Content-Type manuellement
    // Le browser le définit automatiquement avec le bon boundary pour multipart/form-data
    this.isUploadingImage.set(true);
    const formData = new FormData();
    formData.append('file', file);

    const token = this.authService.getToken();
    // On envoie uniquement le Authorization, sans Content-Type pour laisser le browser gérer le multipart
    this.http.post<{ url: string }>(
      'http://localhost:3000/upload/property-image',
      formData,
      { headers: { Authorization: `Bearer ${token}` } }
    ).subscribe({
        next: (res) => {
          this.uploadedImageUrls = [...this.uploadedImageUrls, res.url];
          this.isUploadingImage.set(false);
        },
        error: (err) => {
          console.error('Upload échoué:', err);
          this.isUploadingImage.set(false);
          this.errorMessage = `Échec de l'upload : ${err?.error?.message || err?.statusText || 'Erreur réseau'}`;
        }
      });

    // Réinitialiser pour permettre de sélectionner le même fichier à nouveau
    input.value = '';
  }

  removeImage(index: number) {
    this.uploadedImageUrls = this.uploadedImageUrls.filter((_, i) => i !== index);
    this.imagePreviewUrls = this.imagePreviewUrls.filter((_, i) => i !== index);
  }

  onSubmit() {
    if (this.propertyForm.invalid) return;
    this.isLoading.set(true);
    this.errorMessage = null;

    const formValue = this.propertyForm.value;
    const payload = {
      title: formValue.title,
      description: formValue.description,
      pricePerNight: Number(formValue.pricePerNight),
      maxGuests: Number(formValue.maxGuests),
      address: { city: formValue.city, country: formValue.country },
      images: this.uploadedImageUrls,
      amenities: Object.keys(formValue.amenities || {}).filter(key => (formValue.amenities as any)[key]),
      location: {
        type: 'Point',
        coordinates: this.selectedLocation ? [this.selectedLocation.lng, this.selectedLocation.lat] : [-7.09, 31.79],
      },
    };

    this.propertyService.createProperty(payload).subscribe({
      next: () => {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        setTimeout(() => this.router.navigate(['/dashboard']), 1500);
      },
      error: (err: any) => {
        console.error('Create property error', err);
        this.errorMessage = "Une erreur est survenue lors de la création de l'annonce.";
        this.isLoading.set(false);
      }
    });
  }
}
