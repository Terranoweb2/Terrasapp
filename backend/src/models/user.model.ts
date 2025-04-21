import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';

export interface IUser extends Document {
  name: string;
  email: string;
  phoneNumber?: string;
  password: string;
  avatar?: string;
  bio?: string;
  status: 'online' | 'offline' | 'away' | 'busy' | 'in-call';
  lastSeen: Date;
  contacts: mongoose.Types.ObjectId[];
  verified: boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAuthToken(): string;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        'Please provide a valid email',
      ],
    },
    phoneNumber: {
      type: String,
      match: [/^\+?[1-9]\d{1,14}$/, 'Please provide a valid phone number'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password cannot be less than 6 characters'],
      select: false, // don't return password by default
    },
    avatar: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      maxlength: [250, 'Bio cannot be more than 250 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: ['online', 'offline', 'away', 'busy', 'in-call'],
      default: 'offline',
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    contacts: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    verified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (this: IUser, next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT token
userSchema.methods.generateAuthToken = function (): string {
  // Utiliser une clé secrète fixe pour le développement si elle n'est pas définie
  const JWT_SECRET = process.env.JWT_SECRET || 'terrasapp_development_secret_key';
  
  // Définir explicitement le payload et les options
  const payload = { id: this._id, name: this.name, email: this.email };
  
  try {
    // Utiliser la fonction sign avec des types simplifiés
    return jwt.sign(payload, JWT_SECRET);
  } catch (error) {
    console.error('Error signing JWT token:', error);
    // En cas d'erreur, utiliser une clé de secours simple
    return jwt.sign(payload, 'fallback_secret_key');
  }
};

export default mongoose.model<IUser>('User', userSchema);
