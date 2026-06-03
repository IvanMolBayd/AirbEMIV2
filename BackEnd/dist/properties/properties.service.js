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
exports.PropertiesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = __importStar(require("mongoose"));
const property_schema_1 = require("./schemas/property.schema");
let PropertiesService = class PropertiesService {
    propertyModel;
    constructor(propertyModel) {
        this.propertyModel = propertyModel;
    }
    async create(createPropertyDto, hostId) {
        const newProperty = new this.propertyModel({
            ...createPropertyDto,
            hostId,
        });
        return newProperty.save();
    }
    async findAll(query) {
        const filter = { isActive: true };
        if (query.city) {
            filter['address.city'] = { $regex: new RegExp(query.city, 'i') };
        }
        if (query.title) {
            filter['$text'] = { $search: query.title };
        }
        if (query.guests) {
            filter['maxGuests'] = { $gte: parseInt(query.guests, 10) };
        }
        if (query.lng && query.lat && query.maxDistance) {
            filter.location = {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(query.lng), parseFloat(query.lat)],
                    },
                    $maxDistance: parseInt(query.maxDistance, 10),
                },
            };
        }
        const queryObj = this.propertyModel.find(filter);
        if (query.title) {
            queryObj.sort({ score: { $meta: 'textScore' } });
        }
        return queryObj.exec();
    }
    async findOne(id) {
        const property = await this.propertyModel.findById(id).exec();
        if (!property)
            throw new common_1.NotFoundException(`Property with ID ${id} not found`);
        return property;
    }
    async findByHost(hostId) {
        return this.propertyModel.find({ hostId }).exec();
    }
    async remove(id, hostId) {
        const property = await this.findOne(id);
        if (property.hostId.toString() !== hostId) {
            throw new common_1.NotFoundException('Vous n\'êtes pas le propriétaire de ce logement.');
        }
        await this.propertyModel.findByIdAndDelete(id).exec();
        return { deleted: true };
    }
    async getStats(hostId) {
        return this.propertyModel.aggregate([
            { $match: { hostId: new mongoose_2.default.Types.ObjectId(hostId) } },
            {
                $lookup: {
                    from: 'reviews',
                    localField: '_id',
                    foreignField: 'propertyId',
                    as: 'reviews'
                }
            },
            {
                $project: {
                    title: 1,
                    pricePerNight: 1,
                    reviewsCount: { $size: '$reviews' },
                    averageRating: { $avg: '$reviews.rating' }
                }
            },
            {
                $group: {
                    _id: null,
                    totalProperties: { $sum: 1 },
                    averagePricePerNight: { $avg: '$pricePerNight' },
                    totalReviews: { $sum: '$reviewsCount' },
                    globalAverageRating: { $avg: '$averageRating' },
                    propertiesStats: { $push: { title: '$title', rating: '$averageRating', reviews: '$reviewsCount' } }
                }
            }
        ]);
    }
};
exports.PropertiesService = PropertiesService;
exports.PropertiesService = PropertiesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(property_schema_1.Property.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], PropertiesService);
//# sourceMappingURL=properties.service.js.map