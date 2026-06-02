"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservationsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = __importStar(require("mongoose"));
const reservation_schema_1 = require("./schemas/reservation.schema");
const properties_service_1 = require("../properties/properties.service");
let ReservationsService = class ReservationsService {
    reservationModel;
    propertiesService;
    constructor(reservationModel, propertiesService) {
        this.reservationModel = reservationModel;
        this.propertiesService = propertiesService;
    }
    onModuleInit() {
        try {
            const changeStream = this.reservationModel.watch();
            changeStream.on('change', (change) => {
                if (change.operationType === 'insert') {
                    const doc = change.fullDocument;
                    console.log(`\n[MONGODB CHANGE STREAM] 🛎️ Nouvelle réservation confirmée en temps réel !`);
                    console.log(`-> Logement ID: ${doc?.propertyId}`);
                    console.log(`-> Voyageur ID: ${doc?.guestId}\n`);
                }
            });
        }
        catch (err) {
            console.warn('Change streams non supportés localement sans Replica Set. (Fonctionnera sur Atlas)');
        }
    }
    async create(createReservationDto, guestId) {
        const { propertyId, checkInDate, checkOutDate } = createReservationDto;
        await this.propertiesService.findOne(propertyId);
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);
        if (checkOut <= checkIn) {
            throw new common_1.ConflictException("La date de départ doit être après la date d'arrivée.");
        }
        const propertyObjectId = new mongoose_2.default.Types.ObjectId(propertyId);
        const overlappingReservation = await this.reservationModel.findOne({
            propertyId: propertyObjectId,
            status: { $in: ['confirmed', 'pending'] },
            checkInDate: { $lt: checkOut },
            checkOutDate: { $gt: checkIn },
        }).exec();
        if (overlappingReservation) {
            const fmt = (d) => d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
            throw new common_1.ConflictException(`Ce logement est déjà réservé du ${fmt(new Date(overlappingReservation.checkInDate))} au ${fmt(new Date(overlappingReservation.checkOutDate))}. Veuillez choisir d’autres dates.`);
        }
        const newReservation = new this.reservationModel({
            ...createReservationDto,
            guestId: new mongoose_2.default.Types.ObjectId(guestId),
            propertyId: propertyObjectId,
            checkInDate: checkIn,
            checkOutDate: checkOut,
        });
        return newReservation.save();
    }
    async findMyTrips(guestId) {
        return this.reservationModel.find({ guestId: new mongoose_2.default.Types.ObjectId(guestId) }).populate('propertyId').exec();
    }
};
exports.ReservationsService = ReservationsService;
exports.ReservationsService = ReservationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(reservation_schema_1.Reservation.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        properties_service_1.PropertiesService])
], ReservationsService);
//# sourceMappingURL=reservations.service.js.map