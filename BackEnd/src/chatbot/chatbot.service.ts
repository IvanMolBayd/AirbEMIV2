import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Faq, FaqDocument } from './schemas/faq.schema';
import { PropertiesService } from '../properties/properties.service';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class ChatbotService implements OnModuleInit {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(
    @InjectModel(Faq.name) private faqModel: Model<FaqDocument>,
    private propertiesService: PropertiesService,
    private configService: ConfigService
  ) {
    // Initialisation Gemini avec la clé d'environnement
    const apiKey = this.configService.get<string>('GEMINI_API_KEY') || 'CLE_PAR_DEFAUT';
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
  }

  async onModuleInit() {
    // Seed la base de données avec des questions de base si elle est vide
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

  async handleQuery(userMessage: string): Promise<any> {
    // 1. Chercher dans la FAQ (MongoDB Full-Text Search)
    const faqResult = await this.faqModel.find(
      { $text: { $search: userMessage } },
      { score: { $meta: 'textScore' } }
    ).sort({ score: { $meta: 'textScore' } }).limit(1).exec();

    if (faqResult && faqResult.length > 0 && (faqResult[0] as any)._doc.score > 1.0) {
      return { type: 'text', answer: faqResult[0].answer };
    }

    // 2. Détection d'intention (Recherche de propriété vs Question générale)
    const prompt = `Tu es l'assistant IA de AirBEMI (clone de Airbnb).
    L'utilisateur te dit : "${userMessage}"
    
    Tâche : Détermine l'intention. 
    S'il cherche un logement ou une location, réponds STRICTEMENT avec ce format JSON : {"intent": "search", "city": "nom de la ville ou null", "guests": "nombre ou null", "keywords": "mots clés"}.
    Sinon, réponds normalement comme un agent de voyage avec des recommandations ou de l'aide, sans utiliser de JSON.`;

    try {
      const result = await this.model.generateContent(prompt);
      const responseText = result.response.text();

      // Si c'est du JSON (intention de recherche)
      if (responseText.includes('{"intent"')) {
        const jsonMatch = responseText.match(/\{.*\}/s);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.intent === 'search') {
            // Utiliser PropertiesService pour trouver le logement parfait
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
            } else {
              return { type: 'text', answer: "Je n'ai malheureusement trouvé aucun logement correspondant exactement à vos critères pour le moment." };
            }
          }
        }
      }

      // 3. Réponse IA générale
      return { type: 'text', answer: responseText };

    } catch (err) {
      console.error('Erreur Gemini, activation du fallback hors-ligne:', err.message);
      
      // NLP Hors-Ligne Avancé (Analyse sémantique)
      const lowerMsg = userMessage.toLowerCase();
      
      if (lowerMsg.includes('bonjour') || lowerMsg.includes('salut')) {
        return { type: 'text', answer: "Bonjour ! Je suis en mode de secours (IA hors-ligne). Je peux néanmoins chercher des logements de façon intelligente. Dites-moi ce que vous cherchez ! (Ex: 'cherche un riad avec piscine à marrakech')" };
      }

      if (lowerMsg.includes('cherche') || lowerMsg.includes('trouve') || lowerMsg.includes('veux') || lowerMsg.includes('logement')) {
        // Extraction des entités
        const cities = ['marrakech', 'casablanca', 'agadir', 'rabat', 'tanger', 'fes', 'chefchaouen', 'essaouira'];
        const types = ['villa', 'riad', 'appartement', 'studio', 'bungalow', 'maison', 'chalet'];
        const amenities = ['piscine', 'mer', 'plage', 'wifi', 'parking', 'clim', 'climatisation', 'cuisine'];

        let detectedCity = cities.find(c => lowerMsg.includes(c)) || null;
        let detectedType = types.find(t => lowerMsg.includes(t)) || null;
        
        let detectedAmenities = amenities.filter(a => lowerMsg.includes(a));
        // Normalisation (clim = climatisation)
        if (detectedAmenities.includes('clim') && !detectedAmenities.includes('climatisation')) detectedAmenities.push('climatisation');
        if (detectedAmenities.includes('plage') && !detectedAmenities.includes('mer')) detectedAmenities.push('mer');

        // Construire les mots clés pour la recherche Text (Titre & Description)
        let keywords = [];
        if (detectedType) keywords.push(detectedType);
        keywords = keywords.concat(detectedAmenities);

        const filter: any = {};
        if (detectedCity) filter.city = detectedCity.charAt(0).toUpperCase() + detectedCity.slice(1);
        if (keywords.length > 0) filter.title = keywords.join(' ');

        const properties = await this.propertiesService.findAll(filter);
        
        if (properties.length > 0) {
          return { 
            type: 'property', 
            answer: `J'ai analysé votre demande et trouvé cette propriété parfaite pour vous ! (Mode hors-ligne)`, 
            property: properties[0] 
          };
        } else {
          return { type: 'text', answer: "J'ai bien compris votre demande, mais je n'ai trouvé aucun logement correspondant en base de données actuellement." };
        }
      }
      
      return { type: 'text', answer: "Désolé, ma connexion au modèle IA a échoué (Clé API invalide). Je peux chercher des logements si vous tapez 'cherche' ou répondre aux questions de base !" };
    }
  }
}
