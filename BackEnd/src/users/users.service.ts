import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Property } from '../properties/schemas/property.schema';
import { User, UserDocument } from './schemas/user.schema';
import { UserLike, UserLikeDocument } from './schemas/user-like.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(UserLike.name) private userLikeModel: Model<UserLikeDocument>,
  ) {}

  // Chercher un utilisateur par email
  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  // Chercher un utilisateur par son ID
  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  // Créer un nouvel utilisateur (classique)
  async create(userData: Partial<User>): Promise<UserDocument> {
    const newUser = new this.userModel(userData);
    return newUser.save();
  }

  async addLikedProperty(userId: string, propertyId: string): Promise<UserLikeDocument> {
    const like = await this.userLikeModel
      .findOneAndUpdate(
        { userId, propertyId },
        { $setOnInsert: { userId, propertyId } },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      )
      .exec();

    if (!like) {
      throw new NotFoundException('Unable to store like');
    }

    return like;
  }

  async removeLikedProperty(userId: string, propertyId: string): Promise<{ deleted: boolean }> {
    const result = await this.userLikeModel
      .deleteOne({ userId, propertyId })
      .exec();

    return { deleted: result.deletedCount > 0 };
  }

  async getLikedPropertyIds(userId: string): Promise<string[]> {
    const likes = await this.userLikeModel
      .find({ userId })
      .select('propertyId')
      .exec();

    return likes.map((like) => like.propertyId.toString());
  }

  async getLikedProperties(userId: string): Promise<Property[]> {
    const likes = await this.userLikeModel
      .find({ userId })
      .populate('propertyId')
      .exec();

    return likes
      .map((like) => like.propertyId as unknown as Property)
      .filter((property): property is Property => Boolean(property));
  }

  // Trouver ou créer un utilisateur via Google OAuth2
  async findOrCreateGoogleUser(profile: any): Promise<UserDocument> {
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
    } else if (!user.googleId) {
      // Si l'utilisateur existe déjà avec cet email (inscription classique préalable), on lie le compte Google
      user.googleId = profile.id;
      await user.save();
    }

    return user;
  }
}
