import { Model } from 'mongoose';
import { ReservationDocument } from './schemas/reservation.schema';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { PropertiesService } from '../properties/properties.service';
export declare class ReservationsService {
    private reservationModel;
    private propertiesService;
    constructor(reservationModel: Model<ReservationDocument>, propertiesService: PropertiesService);
    create(createReservationDto: CreateReservationDto, guestId: string): Promise<ReservationDocument>;
    findMyTrips(guestId: string): Promise<ReservationDocument[]>;
}
