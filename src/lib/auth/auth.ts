import bcrypt from 'bcryptjs';
import connectDB from '@/lib/database';
import User, { IUser } from '@/lib/models/User';

export interface AuthResult {
  success: boolean;
  user?: IUser;
  error?: string;
}

export async function authenticateUser(pin: string, userId?: string): Promise<AuthResult> {
  try {
    await connectDB();
    
    let user: IUser | null;
    
    if (userId) {
      user = await User.findById(userId);
    } else {
      // Find user by PIN hash
      const users = await User.find({ isActive: true });
      user = null;
      
      for (const u of users) {
        const isMatch = await bcrypt.compare(pin, u.pinHash);
        if (isMatch) {
          user = u;
          break;
        }
      }
    }
    
    if (!user) {
      return { success: false, error: 'PIN invalide' };
    }
    
    if (!user.isActive) {
      return { success: false, error: 'Compte désactivé' };
    }
    
    if (userId) {
      // Verify PIN for specific user
      const isMatch = await bcrypt.compare(pin, user.pinHash);
      if (!isMatch) {
        return { success: false, error: 'PIN invalide' };
      }
    }
    
    return { success: true, user };
  } catch (error) {
    console.error('Authentication error:', error);
    return { success: false, error: 'Erreur d\'authentification' };
  }
}

export async function hashPin(pin: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(pin, saltRounds);
}

export async function generateTempPin(): Promise<string> {
  return Math.floor(1000 + Math.random() * 9000).toString();
}