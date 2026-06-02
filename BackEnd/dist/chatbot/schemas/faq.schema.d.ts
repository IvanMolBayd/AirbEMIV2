import { Document } from 'mongoose';
export type FaqDocument = Faq & Document;
export declare class Faq {
    question: string;
    answer: string;
    keywords: string[];
}
export declare const FaqSchema: import("mongoose").Schema<Faq, import("mongoose").Model<Faq, any, any, any, any, any, Faq>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Faq, Document<unknown, {}, Faq, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Faq & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    question?: import("mongoose").SchemaDefinitionProperty<string, Faq, Document<unknown, {}, Faq, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Faq & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    answer?: import("mongoose").SchemaDefinitionProperty<string, Faq, Document<unknown, {}, Faq, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Faq & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    keywords?: import("mongoose").SchemaDefinitionProperty<string[], Faq, Document<unknown, {}, Faq, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Faq & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, Faq>;
