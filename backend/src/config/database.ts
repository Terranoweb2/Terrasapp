import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

// Variable pour stocker l'instance du serveur MongoDB en mémoire
let mongoServer: MongoMemoryServer | null = null;

/**
 * Connecte à MongoDB - soit une instance locale, soit une instance en mémoire pour le développement
 */
export const connectDB = async (): Promise<void> => {
  try {
    // Utiliser la variable d'environnement MONGODB_URI si elle existe
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('Connected to MongoDB via URI');
      return;
    }

    // Sinon, utiliser MongoDB Memory Server pour le développement
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    
    await mongoose.connect(uri);
    console.log('Connected to MongoDB Memory Server');
    console.log(`MongoDB URI: ${uri}`);
    
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

/**
 * Déconnecte de MongoDB et arrête le serveur en mémoire si nécessaire
 */
export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    
    if (mongoServer) {
      await mongoServer.stop();
      mongoServer = null;
    }
    
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error disconnecting from MongoDB:', error);
  }
};

/**
 * Initialise la base de données avec les collections nécessaires
 */
export const initializeDB = async (): Promise<void> => {
  // Vérifier si la connexion est établie
  if (!mongoose.connection || !mongoose.connection.db) {
    console.error('Database connection not established');
    return;
  }
  
  // Obtenir la liste des collections existantes
  const collections = await mongoose.connection.db.listCollections().toArray();
  const collectionNames = collections.map(c => c.name);
  
  console.log('Existing collections:', collectionNames);
  
  // Vous pouvez ajouter ici l'initialisation des données par défaut
};
