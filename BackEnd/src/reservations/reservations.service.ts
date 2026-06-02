import { ConflictException, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Reservation, ReservationDocument } from './schemas/reservation.schema';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { PropertiesService } from '../properties/properties.service';

@Injectable()
export class ReservationsService implements OnModuleInit {
  constructor(
    @InjectModel(Reservation.name) private reservationModel: Model<ReservationDocument>,
    private propertiesService: PropertiesService,
  ) {}

  onModuleInit() {
    // EXPERT MONGODB: Change Streams (Écoute en temps réel des modifications DB)
    try {
      const changeStream = this.reservationModel.watch();
      changeStream.on('change', (change) => {
        if (change.operationType === 'insert') {
          const doc = change.fullDocument;
          console.log(`\n[MONGODB CHANGE STREAM] 🛎️ Nouvelle réservation confirmée en temps réel !`);
          console.log(`-> Logement ID: ${doc?.propertyId}`);
          console.log(`-> Voyageur ID: ${doc?.guestId}\n`);
          // En production, on émettrait un événement WebSocket vers l'hôte ici.
        }
      });
    } catch (err) {
      console.warn('Change streams non supportés localement sans Replica Set. (Fonctionnera sur Atlas)');
    }
  }

  async create(createReservationDto: CreateReservationDto, guestId: string): Promise<ReservationDocument> {
    const { propertyId, checkInDate, checkOutDate } = createReservationDto;

    // 1. Vérifier si la propriété existe
    await this.propertiesService.findOne(propertyId);

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (checkOut <= checkIn) {
      throw new ConflictException("La date de départ doit être après la date d'arrivée.");
    }

    // 2. Vérifier la disponibilité (chevauchement de dates) — bloque pending ET confirmed
    const propertyObjectId = new mongoose.Types.ObjectId(propertyId);
    const overlappingReservation = await this.reservationModel.findOne({
      propertyId: propertyObjectId,
      status: { $in: ['confirmed', 'pending'] },
      checkInDate: { $lt: checkOut },
      checkOutDate: { $gt: checkIn },
    }).exec();

    if (overlappingReservation) {
      const fmt = (d: Date) => d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
      throw new ConflictException(
        `Ce logement est déjà réservé du ${fmt(new Date(overlappingReservation.checkInDate as any))} au ${fmt(new Date(overlappingReservation.checkOutDate as any))}. Veuillez choisir d’autres dates.`
      );
    }

    // 3. Créer la réservation
    const newReservation = new this.reservationModel({
      ...createReservationDto,
      guestId: new mongoose.Types.ObjectId(guestId),
      propertyId: propertyObjectId,
      checkInDate: checkIn,
      checkOutDate: checkOut,
    });
    return newReservation.save();
  }

  async findMyTrips(guestId: string): Promise<ReservationDocument[]> {
    return this.reservationModel.find({ guestId: new mongoose.Types.ObjectId(guestId) }).populate('propertyId').exec();
  }
}
