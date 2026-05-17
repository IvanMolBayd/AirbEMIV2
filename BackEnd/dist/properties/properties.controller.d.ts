import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
export declare class PropertiesController {
    private readonly propertiesService;
    constructor(propertiesService: PropertiesService);
    create(createPropertyDto: CreatePropertyDto, req: any): Promise<import("./schemas/property.schema").PropertyDocument>;
    findAll(query: any): Promise<import("./schemas/property.schema").PropertyDocument[]>;
    findOne(id: string): Promise<import("./schemas/property.schema").PropertyDocument>;
}
