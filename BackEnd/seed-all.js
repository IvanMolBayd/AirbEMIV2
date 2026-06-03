/**
 * Script de Seed complet pour AirBEMI
 * Insère des FAQ (chatbot), des utilisateurs, des propriétés, des réservations et des commentaires réalistes.
 */
const mongoose = require('mongoose');
const fs = require('fs');
const bcrypt = require('bcrypt');

// Charger le MONGO_URI depuis .env
const envPath = './.env';
let mongoUri = 'mongodb://localhost:27017/airbemi_db';

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/^MONGO_URI=(.*)$/m);
  if (match && match[1]) {
    mongoUri = match[1].trim();
  }
}

// Définitions des Schemas Mongoose pour le seed
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: false },
  role: { type: String, default: 'user', enum: ['user', 'admin'] },
  isHost: { type: Boolean, default: false },
  googleId: { type: String, required: false }
}, { timestamps: true });

const propertySchema = new mongoose.Schema({
  hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  pricePerNight: { type: Number, required: true },
  maxGuests: { type: Number, required: true },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number]
  },
  address: {
    city: { type: String, required: true },
    country: { type: String, required: true }
  },
  images: [String],
  amenities: [String],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const reservationSchema = new mongoose.Schema({
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  guestId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  checkInDate: Date,
  checkOutDate: Date,
  totalPrice: Number,
  status: { type: String, default: 'pending', enum: ['pending', 'confirmed'] }
}, { timestamps: true });

const reviewSchema = new mongoose.Schema({
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reservationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Reservation', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true }
}, { timestamps: true });

const faqSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  keywords: [String]
}, { timestamps: true });

// Modèles Mongoose
const User = mongoose.models.User || mongoose.model('User', userSchema, 'users');
const Property = mongoose.models.Property || mongoose.model('Property', propertySchema, 'properties');
const Reservation = mongoose.models.Reservation || mongoose.model('Reservation', reservationSchema, 'reservations');
const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema, 'reviews');
const Faq = mongoose.models.Faq || mongoose.model('Faq', faqSchema, 'faqs');

// Questions & Réponses FAQ pour le Chatbot
const FAQ_DATA = [
  {
    question: "Comment réserver une propriété sur AirBEMI ?",
    answer: "Pour effectuer une réservation, rendez-vous sur la fiche du logement souhaité, renseignez vos dates d'arrivée et de départ, choisissez le nombre de voyageurs puis cliquez sur le bouton rouge 'Réserver'. Votre demande passera en état d'attente (pending).",
    keywords: ["réserver", "reserver", "reservation", "réservation", "faire une réservation", "louer"]
  },
  {
    question: "Puis-je annuler ma réservation et comment ?",
    answer: "Oui, vous pouvez gérer et annuler vos séjours directement en vous rendant dans l'onglet 'Réservations' de votre profil utilisateur. Toute annulation libérera instantanément les dates pour les autres voyageurs.",
    keywords: ["annuler", "annulation", "rembourser", "remboursement", "annuler voyage"]
  },
  {
    question: "Comment contacter le support ou l'équipe technique ?",
    answer: "AirBEMI est un projet universitaire académique conçu sur une stack NoSQL moderne (MongoDB, NestJS et Angular). Pour nous contacter, vous pouvez vous adresser à notre équipe de développement directement sur notre dépôt GitHub officiel.",
    keywords: ["contact", "support", "aide", "equipe", "téléphone", "mail", "équipe", "contacter"]
  },
  {
    question: "Quelles sont les villes disponibles sur AirBEMI ?",
    answer: "Nous proposons des logements d'exception dans plusieurs villes marocaines phares : Marrakech (Casa/Riad), Casablanca (Casa/Appartement), Agadir (Villa Plage), Rabat, Tanger, Fès, Essaouira et Chefchaouen.",
    keywords: ["villes", "destination", "maroc", "casa", "marrakech", "agadir", "rabat", "tanger", "fes", "essaouira", "chefchaouen", "casablanca"]
  },
  {
    question: "Comment puis-je proposer mon propre logement (devenir hôte) ?",
    answer: "Devenir hôte est simple ! Connectez-vous, puis cliquez sur '+ Créer une annonce' dans la barre supérieure. Vous pourrez renseigner les détails, télécharger des photos de votre logement, ajouter des équipements et positionner précisément votre logement sur la carte interactive.",
    keywords: ["devenir hote", "devenir hôte", "creer annonce", "créer annonce", "ajouter logement", "mettre en location", "hebergement", "hébergement"]
  },
  {
    question: "Le paiement en ligne est-il sécurisé ?",
    answer: "Actuellement, AirBEMI est en phase de démonstration prototype. Aucun débit réel n'est effectué sur votre carte bancaire. Les frais de service réglementaires de 14% sont calculés à titre indicatif pour un rendu de facture réaliste.",
    keywords: ["paiement", "payer", "carte", "credit", "crédit", "argent", "frais", "sécurisé", "securite"]
  },
  {
    question: "Comment fonctionnent les avis et les scores des propriétés ?",
    answer: "Une fois que vous avez effectué et complété un séjour dans une propriété, une section d'évaluation apparaît sur la page de détail de celle-ci. Vous pouvez attribuer de 1 à 5 étoiles et laisser un commentaire écrit. Le score global est la moyenne mathématique exacte de tous les avis reçus.",
    keywords: ["avis", "commentaire", "etoile", "étoile", "score", "note", "noter", "evaluation", "évaluation"]
  },
  {
    question: "Qu'est-ce que l'effet anti-chevauchement des réservations ?",
    answer: "AirBEMI intègre un algorithme d'exclusion mutuelle rigoureux. Lorsqu'un logement est réservé (que ce soit en attente ou confirmé), l'API bloque toute autre tentative de réservation qui chevaucherait ces mêmes dates pour garantir l'absence de conflits de calendrier.",
    keywords: ["chevauchement", "calendrier", "disponibilité", "disponibilite", "dates", "bloqué", "indisponible", "conflit"]
  }
];

async function seed() {
  console.log('Connexion à MongoDB...');
  await mongoose.connect(mongoUri);
  console.log('✅ Connecté à la base de données.');

  // Nettoyage de la base de données
  console.log('Nettoyage des collections...');
  await User.deleteMany({});
  await Property.deleteMany({});
  await Reservation.deleteMany({});
  await Review.deleteMany({});
  await Faq.deleteMany({});
  console.log('🧹 Base de données nettoyée avec succès.');

  // 1. Seed des Utilisateurs
  console.log('Génération des utilisateurs de test...');
  const salt = await bcrypt.genSalt(10);
  const commonPasswordHash = await bcrypt.hash('password123', salt);

  const userData = [
    {
      firstName: "Alice",
      lastName: "Smith",
      email: "alice.smith.12345@example.com",
      passwordHash: commonPasswordHash,
      role: "user",
      isHost: true
    },
    {
      firstName: "Bob",
      lastName: "Jones",
      email: "bob.jones@example.com",
      passwordHash: commonPasswordHash,
      role: "user",
      isHost: false
    },
    {
      firstName: "Youssef",
      lastName: "Alami",
      email: "youssef.alami@example.com",
      passwordHash: commonPasswordHash,
      role: "user",
      isHost: true
    },
    {
      firstName: "Amina",
      lastName: "Bennani",
      email: "amina.bennani@example.com",
      passwordHash: commonPasswordHash,
      role: "user",
      isHost: false
    },
    {
      firstName: "Karim",
      lastName: "Tazi",
      email: "karim.tazi@example.com",
      passwordHash: commonPasswordHash,
      role: "user",
      isHost: true
    },
    {
      firstName: "Admin",
      lastName: "AirBEMI",
      email: "admin@airbemi.com",
      passwordHash: commonPasswordHash,
      role: "admin",
      isHost: true
    }
  ];

  const createdUsers = await User.insertMany(userData);
  console.log(`✅ ${createdUsers.length} utilisateurs créés.`);

  const alice = createdUsers.find(u => u.email.startsWith('alice'));
  const bob = createdUsers.find(u => u.email.startsWith('bob'));
  const youssef = createdUsers.find(u => u.email.startsWith('youssef'));
  const amina = createdUsers.find(u => u.email.startsWith('amina'));
  const karim = createdUsers.find(u => u.email.startsWith('karim'));

  // 2. Seed des Propriétés
  console.log('Génération des logements...');
  const propertiesData = [
    {
      hostId: alice._id,
      title: "Riad Dar Al Salam — Cœur de la Médina",
      description: "Magnifique riad traditionnel entièrement restauré, alliant architecture hispano-mauresque et confort moderne. Dispose d'un grand patio avec piscine chauffée, toit-terrasse arboré offrant une vue panoramique sur l'Atlas et la Koutoubia.",
      pricePerNight: 1200,
      maxGuests: 6,
      location: { type: "Point", coordinates: [-7.989, 31.628] }, // Marrakech
      address: { city: "Marrakech", country: "Maroc" },
      images: ["https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80"],
      amenities: ["Wi-Fi", "Piscine", "Climatisation", "Cuisine", "Petit-déjeuner"],
      isActive: true
    },
    {
      hostId: alice._id,
      title: "Villa Atlas & Spa — Route de l'Ourika",
      description: "Superbe villa d'architecte contemporaine avec jardin d'un hectare et piscine privée à débordement. Offre calme absolu et vue imprenable sur les montagnes de l'Atlas. Parfait pour de grandes vacances en famille ou entre amis.",
      pricePerNight: 2800,
      maxGuests: 10,
      location: { type: "Point", coordinates: [-7.95, 31.55] }, // Proche Marrakech
      address: { city: "Marrakech", country: "Maroc" },
      images: ["https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&q=80"],
      amenities: ["Wi-Fi", "Piscine", "Parking", "Climatisation", "Jacuzzi"],
      isActive: true
    },
    {
      hostId: youssef._id,
      title: "Appartement de Luxe Vue Mer — Gauthier",
      description: "Appartement haut standing moderne situé dans l'un des quartiers les plus branchés de Casablanca. Entièrement équipé avec balcon et vue dégagée, à proximité immédiate des restaurants, boutiques de luxe et transports.",
      pricePerNight: 850,
      maxGuests: 4,
      location: { type: "Point", coordinates: [-7.62, 33.58] }, // Casablanca
      address: { city: "Casablanca", country: "Maroc" },
      images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80"],
      amenities: ["Wi-Fi", "Climatisation", "Parking", "Cuisine", "Ascenseur"],
      isActive: true
    },
    {
      hostId: youssef._id,
      title: "Studio Design Loft — Centre Anfa",
      description: "Splendide studio meublé façon loft industriel en plein cœur de Casa. Décoration épurée, espace optimisé avec grand écran connecté, machine Nespresso, lit queen-size et espace de travail ergonomique.",
      pricePerNight: 550,
      maxGuests: 2,
      location: { type: "Point", coordinates: [-7.63, 33.59] }, // Casablanca
      address: { city: "Casablanca", country: "Maroc" },
      images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80"],
      amenities: ["Wi-Fi", "Cuisine", "Ascenseur", "Lave-linge"],
      isActive: true
    },
    {
      hostId: karim._id,
      title: "Villa Waterfront Sunset — Baie de Taghazout",
      description: "Accès direct à la plage pour cette sublime villa de vacances. Idéale pour les surfeurs et les amateurs de couchers de soleil. Terrasse immense avec hamacs, barbecue, surfboards à disposition et le doux bruit des vagues en continu.",
      pricePerNight: 1600,
      maxGuests: 6,
      location: { type: "Point", coordinates: [-9.73, 30.54] }, // Taghazout / Agadir
      address: { city: "Agadir", country: "Maroc" },
      images: ["https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&q=80"],
      amenities: ["Wi-Fi", "Parking", "Cuisine", "Plage", "Barbecue"],
      isActive: true
    },
    {
      hostId: karim._id,
      title: "Maison Bleue Traditionnelle — Chefchaouen",
      description: "Vivez une immersion authentique dans la perle bleue du Rif. Cette maison typique sur 3 niveaux est décorée avec les pigments de chaux bleus traditionnels. Elle propose une terrasse splendide sur le toit avec vue sur toute la médina.",
      pricePerNight: 650,
      maxGuests: 5,
      location: { type: "Point", coordinates: [-5.26, 35.17] }, // Chefchaouen
      address: { city: "Chefchaouen", country: "Maroc" },
      images: ["https://upload.wikimedia.org/wikipedia/commons/b/b1/Blue_Town_Chefchaouen.jpg"],
      amenities: ["Wi-Fi", "Cuisine", "Cheminée", "Terrasse"],
      isActive: true
    },
    {
      hostId: alice._id,
      title: "Cat Palace — Le Paradis Félin",
      description: "Un domaine unique conçu spécialement pour les amoureux des chats et de la sérénité. Une superbe bâtisse décorée avec soin contenant tout le confort nécessaire pour vous et vos compagnons.",
      pricePerNight: 950,
      maxGuests: 4,
      location: { type: "Point", coordinates: [-7.98, 31.63] }, // Marrakech
      address: { city: "Marrakech", country: "Maroc" },
      images: ["https://static.wikia.nocookie.net/silly-cat/images/0/05/Hrsthdrtyjjdtk.gif/revision/latest/thumbnail/width/360/height/450?cb=20250321200851"],
      amenities: ["Wi-Fi", "Climatisation", "Cuisine", "Jardin"],
      isActive: true
    }
  ];

  const createdProperties = await Property.insertMany(propertiesData);
  console.log(`✅ ${createdProperties.length} logements créés.`);

  // 3. Seed de quelques Réservations passées et futures
  console.log('Génération des réservations...');
  const prop1 = createdProperties[0]; // Riad Dar Al Salam
  const prop2 = createdProperties[2]; // Luxe Casablanca
  const prop3 = createdProperties[4]; // Villa Taghazout
  const prop4 = createdProperties[6]; // Cat Palace

  const reservationsData = [
    {
      propertyId: prop1._id,
      guestId: bob._id,
      checkInDate: new Date('2026-05-10'),
      checkOutDate: new Date('2026-05-15'),
      totalPrice: (prop1.pricePerNight * 5) * 1.14,
      status: 'confirmed'
    },
    {
      propertyId: prop2._id,
      guestId: amina._id,
      checkInDate: new Date('2026-05-18'),
      checkOutDate: new Date('2026-05-22'),
      totalPrice: (prop2.pricePerNight * 4) * 1.14,
      status: 'confirmed'
    },
    {
      propertyId: prop3._id,
      guestId: bob._id,
      checkInDate: new Date('2026-05-25'),
      checkOutDate: new Date('2026-05-28'),
      totalPrice: (prop3.pricePerNight * 3) * 1.14,
      status: 'confirmed'
    },
    // Réservation passée pour Bob sur Cat Palace pour lui permettre de laisser un avis
    {
      propertyId: prop4._id,
      guestId: bob._id,
      checkInDate: new Date('2026-05-01'),
      checkOutDate: new Date('2026-05-05'),
      totalPrice: (prop4.pricePerNight * 4) * 1.14,
      status: 'confirmed'
    },
    // Réservation future pour Amina sur Riad Dar Al Salam
    {
      propertyId: prop1._id,
      guestId: amina._id,
      checkInDate: new Date('2026-07-10'),
      checkOutDate: new Date('2026-07-15'),
      totalPrice: (prop1.pricePerNight * 5) * 1.14,
      status: 'pending'
    }
  ];

  const createdReservations = await Reservation.insertMany(reservationsData);
  console.log(`✅ ${createdReservations.length} réservations créées.`);

  // 4. Seed des Commentaires (Reviews)
  console.log('Génération des avis voyageurs...');
  const reviewsData = [
    {
      propertyId: prop1._id,
      reviewerId: bob._id,
      reservationId: createdReservations[0]._id,
      rating: 5,
      comment: "Riad incroyable, accueil fantastique avec thé à la menthe et pâtisseries marocaines. Le patio avec piscine est un vrai havre de paix au milieu du bruit de la médina. Nous reviendrons sans hésiter !"
    },
    {
      propertyId: prop2._id,
      reviewerId: amina._id,
      reservationId: createdReservations[1]._id,
      rating: 4,
      comment: "Superbe appartement moderne et propre dans un quartier très animé de Casa. Beaucoup de cafés sympas à proximité. L'hôte Youssef a été hyper disponible pour notre entrée autonome."
    },
    {
      propertyId: prop3._id,
      reviewerId: bob._id,
      reservationId: createdReservations[2]._id,
      rating: 5,
      comment: "Le paradis absolu ! Se réveiller avec la vue sur l'océan Atlantique et prendre son petit-déjeuner sur la terrasse était exceptionnel. La villa est spacieuse et très bien équipée pour cuisiner."
    },
    {
      propertyId: prop4._id,
      reviewerId: bob._id,
      reservationId: createdReservations[3]._id,
      rating: 5,
      comment: "Le paradis pour les amoureux des chats ! Les félins sont rois ici et le logement est impeccable. Très reposant et calme."
    }
  ];

  await Review.insertMany(reviewsData);
  console.log('✅ Avis voyageurs insérés.');

  // 5. Seed des FAQ / Chatbot
  console.log('Génération de la base de connaissances FAQ du Chatbot...');
  await Faq.insertMany(FAQ_DATA);
  console.log(`✅ ${FAQ_DATA.length} questions FAQ insérées.`);

  console.log('\n======================================================');
  console.log('🎉 POPULATION DE LA BASE DE DONNEES ACCOMPLIE AVEC SUCCES !');
  console.log('======================================================');
  console.log('Identifiants de test disponibles (tous avec password123) :');
  console.log(' - Hôte/Voyageur : alice.smith.12345@example.com');
  console.log(' - Hôte/Voyageur : youssef.alami@example.com');
  console.log(' - Voyageur      : bob.jones@example.com');
  console.log(' - Voyageur      : amina.bennani@example.com');
  console.log('======================================================\n');

  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('❌ Erreur lors du seed complet:', err);
  process.exit(1);
});
