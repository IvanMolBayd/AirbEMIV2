"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatbotService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const faq_schema_1 = require("./schemas/faq.schema");
const properties_service_1 = require("../properties/properties.service");
const config_1 = require("@nestjs/config");
const generative_ai_1 = require("@google/generative-ai");
let ChatbotService = class ChatbotService {
    faqModel;
    propertiesService;
    configService;
    genAI;
    model;
    constructor(faqModel, propertiesService, configService) {
        this.faqModel = faqModel;
        this.propertiesService = propertiesService;
        this.configService = configService;
        const apiKey = this.configService.get('GEMINI_API_KEY') || 'CLE_PAR_DEFAUT';
        this.genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
    }
    async onModuleInit() {
        const count = await this.faqModel.countDocuments();
        if (count === 0) {
            await this.faqModel.insertMany([
                { question: 'Comment annuler une réservation ?', answer: 'Vous pouvez annuler votre réservation depuis la section "Mes voyages" de votre profil.', keywords: ['annuler', 'annulation', 'remboursement'] },
                { question: 'Comment devenir hôte ?', answer: 'Cliquez sur "Nouvelle annonce" ou "Créer une annonce" dans la barre de navigation pour commencer à louer votre bien !', keywords: ['hôte', 'louer', 'annonce'] },
                { question: 'Comment vous contacter ?', answer: 'AirBEMI est un projet étudiant, mais vous pouvez envoyer un pigeon voyageur !', keywords: ['contact', 'support', 'aide'] }
            ]);
            console.log('[CHATBOT] 📚 Base de connaissances FAQ initialisée !');
        }
    }
    async handleQuery(userMessage) {
        const faqResult = await this.faqModel.find({ $text: { $search: userMessage } }, { score: { $meta: 'textScore' } }).sort({ score: { $meta: 'textScore' } }).limit(1).exec();
        if (faqResult && faqResult.length > 0 && faqResult[0]._doc.score > 1.0) {
            return { type: 'text', answer: faqResult[0].answer };
        }
        const prompt = `Tu es l'assistant IA de AirBEMI (clone de Airbnb).
    L'utilisateur te dit : "${userMessage}"
    
    Tâche : Détermine l'intention. 
    S'il cherche un logement ou une location, réponds STRICTEMENT avec ce format JSON : {"intent": "search", "city": "nom de la ville ou null", "guests": "nombre ou null", "keywords": "mots clés"}.
    Sinon, réponds normalement comme un agent de voyage avec des recommandations ou de l'aide, sans utiliser de JSON.`;
        try {
            const result = await this.model.generateContent(prompt);
            const responseText = result.response.text();
            if (responseText.includes('{"intent"')) {
                const jsonMatch = responseText.match(/\{.*\}/s);
                if (jsonMatch) {
                    const parsed = JSON.parse(jsonMatch[0]);
                    if (parsed.intent === 'search') {
                        const properties = await this.propertiesService.findAll({
                            city: parsed.city,
                            title: parsed.keywords,
                            guests: parsed.guests
                        });
                        if (properties.length > 0) {
                            const bestMatch = properties[0];
                            return {
                                type: 'property',
                                answer: `J'ai trouvé quelque chose qui pourrait vous plaire !`,
                                property: bestMatch
                            };
                        }
                        else {
                            return { type: 'text', answer: "Je n'ai malheureusement trouvé aucun logement correspondant exactement à vos critères pour le moment." };
                        }
                    }
                }
            }
            return { type: 'text', answer: responseText };
        }
        catch (err) {
            console.error('Erreur Gemini, activation du fallback hors-ligne:', err.message);
            const lowerMsg = userMessage.toLowerCase();
            if (lowerMsg.includes('bonjour') || lowerMsg.includes('salut')) {
                return { type: 'text', answer: "Bonjour ! Je suis en mode de secours (IA hors-ligne). Je peux néanmoins chercher des logements de façon intelligente. Dites-moi ce que vous cherchez ! (Ex: 'cherche un riad avec piscine à marrakech')" };
            }
            if (lowerMsg.includes('cherche') || lowerMsg.includes('trouve') || lowerMsg.includes('veux') || lowerMsg.includes('logement')) {
                const cities = ['marrakech', 'casablanca', 'agadir', 'rabat', 'tanger', 'fes', 'chefchaouen', 'essaouira'];
                const types = ['villa', 'riad', 'appartement', 'studio', 'bungalow', 'maison', 'chalet'];
                const amenities = ['piscine', 'mer', 'plage', 'wifi', 'parking', 'clim', 'climatisation', 'cuisine'];
                let detectedCity = cities.find(c => lowerMsg.includes(c)) || null;
                let detectedType = types.find(t => lowerMsg.includes(t)) || null;
                let detectedAmenities = amenities.filter(a => lowerMsg.includes(a));
                if (detectedAmenities.includes('clim') && !detectedAmenities.includes('climatisation'))
                    detectedAmenities.push('climatisation');
                if (detectedAmenities.includes('plage') && !detectedAmenities.includes('mer'))
                    detectedAmenities.push('mer');
                let keywords = [];
                if (detectedType)
                    keywords.push(detectedType);
                keywords = keywords.concat(detectedAmenities);
                const filter = {};
                if (detectedCity)
                    filter.city = detectedCity.charAt(0).toUpperCase() + detectedCity.slice(1);
                if (keywords.length > 0)
                    filter.title = keywords.join(' ');
                const properties = await this.propertiesService.findAll(filter);
                if (properties.length > 0) {
                    return {
                        type: 'property',
                        answer: `J'ai analysé votre demande et trouvé cette propriété parfaite pour vous ! (Mode hors-ligne)`,
                        property: properties[0]
                    };
                }
                else {
                    return { type: 'text', answer: "J'ai bien compris votre demande, mais je n'ai trouvé aucun logement correspondant en base de données actuellement." };
                }
            }
            return { type: 'text', answer: "Désolé, ma connexion au modèle IA a échoué (Clé API invalide). Je peux chercher des logements si vous tapez 'cherche' ou répondre aux questions de base !" };
        }
    }
};
exports.ChatbotService = ChatbotService;
exports.ChatbotService = ChatbotService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(faq_schema_1.Faq.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        properties_service_1.PropertiesService,
        config_1.ConfigService])
], ChatbotService);
//# sourceMappingURL=chatbot.service.js.map