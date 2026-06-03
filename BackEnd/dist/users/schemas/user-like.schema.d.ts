import mongoose, { Document } from 'mongoose';
export type UserLikeDocument = UserLike & Document;
export declare class UserLike {
    userId: string;
    propertyId: string;
}
export declare const UserLikeSchema: mongoose.Schema<UserLike, mongoose.Model<UserLike, any, any, any, any, any, UserLike>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, UserLike, mongoose.Document<unknown, {}, UserLike, {
    id: string;
}, mongoose.DefaultSchemaOptions> & Omit<UserLike & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    userId?: mongoose.SchemaDefinitionProperty<string, UserLike, mongoose.Document<unknown, {}, UserLike, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<UserLike & {
        _id: mongoose.Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    propertyId?: mongoose.SchemaDefinitionProperty<string, UserLike, mongoose.Document<unknown, {}, UserLike, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<UserLike & {
        _id: mongoose.Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, UserLike>;
