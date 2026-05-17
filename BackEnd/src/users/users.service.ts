import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

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
