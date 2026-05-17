import mongoose, { Document } from 'mongoose';
export type ReviewDocument = Review & Document;
export declare class Review {
    propertyId: string;
    reviewerId: string;
    reservationId: string;
    rating: number;
    comment: string;
}
export declare const ReviewSchema: mongoose.Schema<Review, mongoose.Model<Review, any, any, any, any, any, Review>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, Review, mongoose.Document<unknown, {}, Review, {
    id: string;
}, mongoose.DefaultSchemaOptions> & Omit<Review & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    propertyId?: mongoose.SchemaDefinitionProperty<string, Review, mongoose.Document<unknown, {}, Review, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<Review & {
        _id: mongoose.Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    reviewerId?: mongoose.SchemaDefinitionProperty<string, Review, mongoose.Document<unknown, {}, Review, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<Review & {
        _id: mongoose.Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    reservationId?: mongoose.SchemaDefinitionProperty<string, Review, mongoose.Document<unknown, {}, Review, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<Review & {
        _id: mongoose.Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    rating?: mongoose.SchemaDefinitionProperty<number, Review, mongoose.Document<unknown, {}, Review, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<Review & {
        _id: mongoose.Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    comment?: mongoose.SchemaDefinitionProperty<string, Review, mongoose.Document<unknown, {}, Review, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<Review & {
        _id: mongoose.Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, Review>;
