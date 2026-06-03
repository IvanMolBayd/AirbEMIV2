"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("./schemas/user.schema");
const user_like_schema_1 = require("./schemas/user-like.schema");
let UsersService = class UsersService {
    userModel;
    userLikeModel;
    constructor(userModel, userLikeModel) {
        this.userModel = userModel;
        this.userLikeModel = userLikeModel;
    }
    async findByEmail(email) {
        return this.userModel.findOne({ email }).exec();
    }
    async findById(id) {
        return this.userModel.findById(id).exec();
    }
    async create(userData) {
        const newUser = new this.userModel(userData);
        return newUser.save();
    }
    async addLikedProperty(userId, propertyId) {
        const like = await this.userLikeModel
            .findOneAndUpdate({ userId, propertyId }, { $setOnInsert: { userId, propertyId } }, { upsert: true, new: true, setDefaultsOnInsert: true })
            .exec();
        if (!like) {
            throw new common_1.NotFoundException('Unable to store like');
        }
        return like;
    }
    async removeLikedProperty(userId, propertyId) {
        const result = await this.userLikeModel
            .deleteOne({ userId, propertyId })
            .exec();
        return { deleted: result.deletedCount > 0 };
    }
    async getLikedPropertyIds(userId) {
        const likes = await this.userLikeModel
            .find({ userId })
            .select('propertyId')
            .exec();
        return likes.map((like) => like.propertyId.toString());
    }
    async getLikedProperties(userId) {
        const likes = await this.userLikeModel
            .find({ userId })
            .populate('propertyId')
            .exec();
        return likes
            .map((like) => like.propertyId)
            .filter((property) => Boolean(property));
    }
    async findOrCreateGoogleUser(profile) {
        const email = profile.emails[0].value;
        let user = await this.findByEmail(email);
        if (!user) {
            user = await this.create({
                email,
                firstName: profile.name.givenName || 'Utilisateur',
                lastName: profile.name.familyName || 'Google',
                googleId: profile.id,
                role: 'user',
                isHost: false,
            });
        }
        else if (!user.googleId) {
            user.googleId = profile.id;
            await user.save();
        }
        return user;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(1, (0, mongoose_1.InjectModel)(user_like_schema_1.UserLike.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], UsersService);
//# sourceMappingURL=users.service.js.map