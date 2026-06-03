import { Controller, Delete, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PropertiesService } from '../properties/properties.service';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly propertiesService: PropertiesService,
  ) {}

  @Get('me/likes')
  @UseGuards(JwtAuthGuard)
  async getMyLikes(@Request() req: any) {
    return this.usersService.getLikedProperties(req.user.userId);
  }

  @Post('me/likes/:propertyId')
  @UseGuards(JwtAuthGuard)
  async likeProperty(@Param('propertyId') propertyId: string, @Request() req: any) {
    await this.propertiesService.findOne(propertyId);
    await this.usersService.addLikedProperty(req.user.userId, propertyId);
    const likedProperties = await this.usersService.getLikedPropertyIds(req.user.userId);

    return {
      liked: true,
      likedProperties,
    };
  }

  @Delete('me/likes/:propertyId')
  @UseGuards(JwtAuthGuard)
  async unlikeProperty(@Param('propertyId') propertyId: string, @Request() req: any) {
    await this.propertiesService.findOne(propertyId);
    await this.usersService.removeLikedProperty(req.user.userId, propertyId);
    const likedProperties = await this.usersService.getLikedPropertyIds(req.user.userId);

    return {
      liked: false,
      likedProperties,
    };
  }
}
