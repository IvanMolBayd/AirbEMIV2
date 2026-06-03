import { PropertiesService } from '../properties/properties.service';
import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    private readonly propertiesService;
    constructor(usersService: UsersService, propertiesService: PropertiesService);
    getMyLikes(req: any): Promise<import("../properties/schemas/property.schema").Property[]>;
    likeProperty(propertyId: string, req: any): Promise<{
        liked: boolean;
        likedProperties: string[];
    }>;
    unlikeProperty(propertyId: string, req: any): Promise<{
        liked: boolean;
        likedProperties: string[];
    }>;
}
