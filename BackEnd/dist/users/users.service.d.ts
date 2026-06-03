import { Model } from 'mongoose';
import { Property } from '../properties/schemas/property.schema';
import { User, UserDocument } from './schemas/user.schema';
import { UserLikeDocument } from './schemas/user-like.schema';
export declare class UsersService {
    private userModel;
    private userLikeModel;
    constructor(userModel: Model<UserDocument>, userLikeModel: Model<UserLikeDocument>);
    findByEmail(email: string): Promise<UserDocument | null>;
    findById(id: string): Promise<UserDocument | null>;
    create(userData: Partial<User>): Promise<UserDocument>;
    addLikedProperty(userId: string, propertyId: string): Promise<UserLikeDocument>;
    removeLikedProperty(userId: string, propertyId: string): Promise<{
        deleted: boolean;
    }>;
    getLikedPropertyIds(userId: string): Promise<string[]>;
    getLikedProperties(userId: string): Promise<Property[]>;
    findOrCreateGoogleUser(profile: any): Promise<UserDocument>;
}
