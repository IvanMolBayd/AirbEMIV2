import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
export declare class PropertiesController {
    private readonly propertiesService;
    constructor(propertiesService: PropertiesService);
    create(createPropertyDto: CreatePropertyDto, req: any): Promise<import("./schemas/property.schema").PropertyDocument>;
    uploadImage(file: Express.Multer.File): {
        url: string;
        filename: string;
    };
    findMyListings(req: any): Promise<import("./schemas/property.schema").PropertyDocument[]>;
    getStats(req: any): Promise<any>;
    remove(id: string, req: any): Promise<{
        deleted: boolean;
    }>;
    findAll(query: any): Promise<import("./schemas/property.schema").PropertyDocument[]>;
    findOne(id: string): Promise<import("./schemas/property.schema").PropertyDocument>;
}
