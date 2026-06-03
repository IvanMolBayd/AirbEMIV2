import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PropertiesModule } from '../properties/properties.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserLike, UserLikeSchema } from './schemas/user-like.schema';
import { User, UserSchema } from './schemas/user.schema';

@Module({
  imports: [
    PropertiesModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: UserLike.name, schema: UserLikeSchema },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // ExportÃ© pour Ãªtre utilisÃ© dans AuthService
})
export class UsersModule {}
