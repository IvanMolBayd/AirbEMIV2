import { OnModuleInit } from '@nestjs/common';
import { Model } from 'mongoose';
import { ReservationDocument } from './schemas/reservation.schema';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { PropertiesService } from '../properties/properties.service';
export declare class ReservationsService implements OnModuleInit {
    private reservationModel;
    private propertiesService;
    constructor(reservationModel: Model<ReservationDocument>, propertiesService: PropertiesService);
    onModuleInit(): void;
    create(createReservationDto: CreateReservationDto, guestId: string): Promise<ReservationDocument>;
    findMyTrips(guestId: string): Promise<ReservationDocument[]>;
}
