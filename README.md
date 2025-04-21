# Terrasapp

![Terrasapp Logo](frontend/public/logo192.png)

Terrasapp est une application moderne de messagerie et de gestion de fichiers conçue pour une communication et une collaboration efficaces.

## 📋 Fonctionnalités

### Messagerie
- Conversations en temps réel
- Support pour le partage de fichiers et médias
- Indicateurs de statut (en ligne, hors ligne, occupé)
- Appels vidéo et audio (à venir)

### Gestion de fichiers
- Upload et prévisualisation de fichiers
- Organisation par dossiers et étiquettes
- Recherche avancée
- Modération de contenu par IA
- Partage sécurisé de fichiers

### Interface utilisateur
- Design responsive et moderne
- Mode sombre/clair
- Notifications en temps réel
- Support multilingue (en cours de développement)

## 🛠️ Technologies utilisées

### Frontend
- React 
- TypeScript
- Tailwind CSS
- Heroicons
- Context API pour la gestion d'état

### Backend
- Node.js
- Express
- TypeScript
- MongoDB avec Mongoose
- JWT pour l'authentification
- Socket.io pour la communication en temps réel

## 🚀 Installation et démarrage

### Prérequis
- Node.js (v14+)
- MongoDB
- Git

### Étapes d'installation

#### Cloner le dépôt
```bash
git clone https://github.com/Terranoweb2/Terrasapp.git
cd Terrasapp
```

#### Installation du backend
```bash
cd backend
npm install
cp .env.example .env  # Créer et configurer le fichier .env avec vos variables d'environnement
npm run dev  # Démarrer le serveur en mode développement
```

#### Installation du frontend
```bash
cd frontend
npm install
npm start  # Démarrer l'application React
```

## 📷 Captures d'écran

*Des captures d'écran seront ajoutées prochainement*

## 🧪 Mode développement

Pour le développement et les tests, vous pouvez utiliser le mode développement qui permet de contourner l'authentification :

```javascript
// Dans le fichier .env du backend
NODE_ENV=development
```

## 📝 Structure du projet

### Frontend
```
/frontend
  /public            # Ressources statiques
  /src
    /components      # Composants React réutilisables
      /Chat          # Composants liés à la messagerie
      /FileManagement # Composants liés à la gestion de fichiers
      /Layout        # Composants structurels
      /MessageComponents # Composants pour la page Messages
      /UI            # Composants d'interface utilisateur génériques
    /context         # Contextes React pour la gestion d'état
    /pages           # Pages principales de l'application
    /services        # Services pour les appels API
    /types           # Définitions TypeScript
    /utils           # Fonctions utilitaires
```

### Backend
```
/backend
  /src
    /config          # Configuration de l'application
    /controllers     # Contrôleurs pour gérer les requêtes
    /middleware      # Middleware Express
    /models          # Modèles de données Mongoose
    /routes          # Routes de l'API
    /services        # Services (upload, IA, etc.)
    /types           # Définitions TypeScript
```

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
1. Fork le projet
2. Créer une branche pour votre fonctionnalité (`git checkout -b feature/amazing-feature`)
3. Commiter vos changements (`git commit -m 'Add some amazing feature'`)
4. Push vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

## 📜 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus d'informations.

## 📞 Contact

Pour toute question ou suggestion, n'hésitez pas à ouvrir une issue sur GitHub.

---

Développé avec ❤️ par l'équipe Terranoweb2
