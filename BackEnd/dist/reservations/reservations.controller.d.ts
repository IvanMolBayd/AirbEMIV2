import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
export declare class ReservationsController {
    private readonly reservationsService;
    constructor(reservationsService: ReservationsService);
    create(createReservationDto: CreateReservationDto, req: any): Promise<import("./schemas/reservation.schema").ReservationDocument>;
    findMyTrips(req: any): Promise<import("./schemas/reservation.schema").ReservationDocument[]>;
}
