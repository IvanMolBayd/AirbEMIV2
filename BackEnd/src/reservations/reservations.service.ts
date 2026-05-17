import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Reservation, ReservationDocument } from './schemas/reservation.schema';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { PropertiesService } from '../properties/properties.service';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectModel(Reservation.name) private reservationModel: Model<ReservationDocument>,
    private propertiesService: PropertiesService,
  ) {}

  async create(createReservationDto: CreateReservationDto, guestId: string): Promise<ReservationDocument> {
    const { propertyId, checkInDate, checkOutDate } = createReservationDto;

    // 1. Vérifier si la propriété existe
    await this.propertiesService.findOne(propertyId);

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    // 2. Vérifier la disponibilité (chevauchement de dates)
    const overlappingReservation = await this.reservationModel.findOne({
      propertyId,
      status: 'confirmed',
      $or: [
        { checkInDate: { $lt: checkOut }, checkOutDate: { $gt: checkIn } },
      ],
    }).exec();

    if (overlappingReservation) {
      throw new ConflictException('Le logement est indisponible pour ces dates.');
    }

    // 3. Créer la réservation
    const newReservation = new this.reservationModel({
      ...createReservationDto,
      guestId,
      checkInDate: checkIn,
      checkOutDate: checkOut,
    });
    return newReservation.save();
  }

  async findMyTrips(guestId: string): Promise<ReservationDocument[]> {
    return this.reservationModel.find({ guestId }).populate('propertyId').exec();
  }
}
