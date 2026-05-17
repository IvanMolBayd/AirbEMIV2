import mongoose, { Document } from 'mongoose';
export type ReservationDocument = Reservation & Document;
export declare class Reservation {
    propertyId: string;
    guestId: string;
    checkInDate: Date;
    checkOutDate: Date;
    totalPrice: number;
    status: string;
}
export declare const ReservationSchema: mongoose.Schema<Reservation, mongoose.Model<Reservation, any, any, any, any, any, Reservation>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, Reservation, mongoose.Document<unknown, {}, Reservation, {
    id: string;
}, mongoose.DefaultSchemaOptions> & Omit<Reservation & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    propertyId?: mongoose.SchemaDefinitionProperty<string, Reservation, mongoose.Document<unknown, {}, Reservation, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<Reservation & {
        _id: mongoose.Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    guestId?: mongoose.SchemaDefinitionProperty<string, Reservation, mongoose.Document<unknown, {}, Reservation, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<Reservation & {
        _id: mongoose.Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    checkInDate?: mongoose.SchemaDefinitionProperty<Date, Reservation, mongoose.Document<unknown, {}, Reservation, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<Reservation & {
        _id: mongoose.Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    checkOutDate?: mongoose.SchemaDefinitionProperty<Date, Reservation, mongoose.Document<unknown, {}, Reservation, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<Reservation & {
        _id: mongoose.Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    totalPrice?: mongoose.SchemaDefinitionProperty<number, Reservation, mongoose.Document<unknown, {}, Reservation, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<Reservation & {
        _id: mongoose.Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    status?: mongoose.SchemaDefinitionProperty<string, Reservation, mongoose.Document<unknown, {}, Reservation, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<Reservation & {
        _id: mongoose.Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, Reservation>;
