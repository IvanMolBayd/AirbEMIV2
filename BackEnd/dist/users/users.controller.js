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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const properties_service_1 = require("../properties/properties.service");
const users_service_1 = require("./users.service");
let UsersController = class UsersController {
    usersService;
    propertiesService;
    constructor(usersService, propertiesService) {
        this.usersService = usersService;
        this.propertiesService = propertiesService;
    }
    async getMyLikes(req) {
        return this.usersService.getLikedProperties(req.user.userId);
    }
    async likeProperty(propertyId, req) {
        await this.propertiesService.findOne(propertyId);
        await this.usersService.addLikedProperty(req.user.userId, propertyId);
        const likedProperties = await this.usersService.getLikedPropertyIds(req.user.userId);
        return {
            liked: true,
            likedProperties,
        };
    }
    async unlikeProperty(propertyId, req) {
        await this.propertiesService.findOne(propertyId);
        await this.usersService.removeLikedProperty(req.user.userId, propertyId);
        const likedProperties = await this.usersService.getLikedPropertyIds(req.user.userId);
        return {
            liked: false,
            likedProperties,
        };
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)('me/likes'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getMyLikes", null);
__decorate([
    (0, common_1.Post)('me/likes/:propertyId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('propertyId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "likeProperty", null);
__decorate([
    (0, common_1.Delete)('me/likes/:propertyId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('propertyId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "unlikeProperty", null);
exports.UsersController = UsersController = __decorate([
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        properties_service_1.PropertiesService])
], UsersController);
//# sourceMappingURL=users.controller.js.map