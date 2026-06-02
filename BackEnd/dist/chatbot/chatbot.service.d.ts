import { OnModuleInit } from '@nestjs/common';
import { Model } from 'mongoose';
import { FaqDocument } from './schemas/faq.schema';
import { PropertiesService } from '../properties/properties.service';
import { ConfigService } from '@nestjs/config';
export declare class ChatbotService implements OnModuleInit {
    private faqModel;
    private propertiesService;
    private configService;
    private genAI;
    private model;
    constructor(faqModel: Model<FaqDocument>, propertiesService: PropertiesService, configService: ConfigService);
    onModuleInit(): Promise<void>;
    handleQuery(userMessage: string): Promise<any>;
}
