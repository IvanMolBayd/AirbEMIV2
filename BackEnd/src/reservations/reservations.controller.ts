import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createReservationDto: CreateReservationDto, @Request() req: any) {
    const guestId = req.user.userId;
    return this.reservationsService.create(createReservationDto, guestId);
  }

  @Get('my-trips')
  @UseGuards(JwtAuthGuard)
  findMyTrips(@Request() req: any) {
    const guestId = req.user.userId;
    return this.reservationsService.findMyTrips(guestId);
  }
}
