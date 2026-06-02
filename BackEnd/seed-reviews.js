/**
 * Script de Seed pour les Commentaires (Reviews) - AirBEMI
 * Insère des commentaires liés à des logements, utilisateurs et réservations existants.
 * Si le site n'a pas encore d'utilisateurs ou de logements, il en crée temporairement.
 */
const mongoose = require('mongoose');
const fs = require('fs');

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

// Définition des Schemas
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, default: 'user' },
  isHost: { type: Boolean, default: false }
}, { timestamps: true });

const propertySchema = new mongoose.Schema({
  title: String,
  pricePerNight: Number,
  address: { city: String, country: String }
}, { timestamps: true });

const reservationSchema = new mongoose.Schema({
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  guestId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  checkInDate: Date,
  checkOutDate: Date,
  totalPrice: Number,
  status: { type: String, default: 'confirmed' }
}, { timestamps: true });

const reviewSchema = new mongoose.Schema({
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reservationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Reservation', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true }
}, { timestamps: true });

// Modèles mongoose (si déjà enregistrés par ailleurs on les réutilise, sinon on les compile)
const User = mongoose.models.User || mongoose.model('User', userSchema, 'users');
const Property = mongoose.models.Property || mongoose.model('Property', propertySchema, 'properties');
const Reservation = mongoose.models.Reservation || mongoose.model('Reservation', reservationSchema, 'reservations');
const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema, 'reviews');

const SAMPLE_REVIEWS = [
  { rating: 5, comment: "Absolument fantastique ! L'endroit est magnifique, propre, et très bien situé. L'hôte était très accueillant." },
  { rating: 4, comment: "Très bon séjour dans l'ensemble. La vue est incroyable. Un peu de bruit le soir mais rien de bien méchant." },
  { rating: 5, comment: "Une expérience inoubliable ! Le service était impeccable et le lit extrêmement confortable. Je recommande vivement." },
  { rating: 5, comment: "Parfait pour un séjour en famille. Proche de toutes commodités et très propre. Merci encore !" },
  { rating: 4, comment: "Logement confortable et décoré avec goût. Idéal pour un week-end de détente." }
];

async function seed() {
  console.log('Connexion à MongoDB Atlas...');
  await mongoose.connect(mongoUri);
  console.log('✅ Connecté avec succès !');

  // 1. Récupérer des logements existants
  let properties = await Property.find().limit(5);
  if (properties.length === 0) {
    console.log("⚠️ Aucun logement trouvé dans la base. Création de quelques logements d'abord...");
    // Créer deux logements par défaut si la base est vide
    const defaultHostId = new mongoose.Types.ObjectId();
    const newProperties = [
      {
        title: 'Appartement Cosy — Centre Marrakech',
        pricePerNight: 550,
        address: { city: 'Marrakech', country: 'Maroc' }
      },
      {
        title: 'Riad Traditionnel — Fès',
        pricePerNight: 900,
        address: { city: 'Fès', country: 'Maroc' }
      }
    ];
    properties = await Property.insertMany(newProperties);
    console.log(`✅ ${properties.length} logements créés par défaut.`);
  } else {
    console.log(`ℹ️ ${properties.length} logement(s) trouvé(s) dans la base.`);
  }

  // 2. Créer ou trouver des utilisateurs de test pour faire les commentaires
  const reviewerEmails = ['test.user1@example.com', 'test.user2@example.com', 'test.user3@example.com'];
  const testReviewers = [];

  for (let i = 0; i < reviewerEmails.length; i++) {
    const email = reviewerEmails[i];
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        firstName: `Voyageur${i + 1}`,
        lastName: `Avis${i + 1}`,
        email: email,
        role: 'user',
        isHost: false
      });
      await user.save();
      console.log(`✅ Nouvel utilisateur de test créé : ${email}`);
    } else {
      console.log(`ℹ️ Utilisateur de test existant trouvé : ${email}`);
    }
    testReviewers.push(user);
  }

  // 3. Pour chaque logement, créer une réservation puis un commentaire par un de nos testReviewers
  let reviewsInserted = 0;
  for (let i = 0; i < properties.length; i++) {
    const property = properties[i];
    const reviewer = testReviewers[i % testReviewers.length];
    
    // Créer une réservation factice
    const checkIn = new Date();
    checkIn.setDate(checkIn.getDate() - 10 - i);
    const checkOut = new Date();
    checkOut.setDate(checkOut.getDate() - 7 - i);

    const reservation = new Reservation({
      propertyId: property._id,
      guestId: reviewer._id,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      totalPrice: (property.pricePerNight || 500) * 3,
      status: 'confirmed'
    });
    await reservation.save();

    // Associer un commentaire
    const sample = SAMPLE_REVIEWS[i % SAMPLE_REVIEWS.length];
    const review = new Review({
      propertyId: property._id,
      reviewerId: reviewer._id,
      reservationId: reservation._id,
      rating: sample.rating,
      comment: sample.comment
    });
    await review.save();
    reviewsInserted++;
  }

  console.log(`\n🎉 Seed terminé ! ${reviewsInserted} commentaires et réservations associés ont été insérés dans MongoDB.`);
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('❌ Erreur lors du seed des commentaires:', err);
  process.exit(1);
});
