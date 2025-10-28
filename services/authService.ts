import { db, auth } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
// FIX: Changed to namespace import to fix module resolution issues.
import * as firebaseAuth from 'firebase/auth';
import type { User } from '../types';

export type UserRole =
  | 'AdminGeral'
  | 'Administrativo'
  | 'Producao'
  | 'Vendas'
  | 'Financeiro'
  | 'Conteudo';

export interface AuthUser {
  uid: string;
  email: string;
  role: UserRole;
}

export const login = async (email: string, password: string): Promise<AuthUser> => {
  // FIX: Use function from the imported namespace.
  const userCredential = await firebaseAuth.signInWithEmailAndPassword(auth, email, password);
  if (!userCredential.user) {
    throw new Error('User authentication failed.');
  }
  return await getUserProfile(userCredential.user);
};

export const logout = async (): Promise<void> => {
  // FIX: Use function from the imported namespace.
  await firebaseAuth.signOut(auth);
};

// FIX: Use the User type from the imported namespace.
export const getUserProfile = async (firebaseUser: firebaseAuth.User): Promise<AuthUser> => {
  const userDocRef = doc(db, 'users', firebaseUser.uid);
  const userDocSnap = await getDoc(userDocRef);

  // Default role is 'Vendas' if not found in Firestore
  const role = userDocSnap.exists() ? (userDocSnap.data().role as UserRole) : 'Vendas';
  
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email || '',
    role: role,
  };
};

export const listenAuthChanges = (callback: (user: AuthUser | null) => void) => {
  // FIX: Use function from the imported namespace.
  return firebaseAuth.onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      const userProfile = await getUserProfile(firebaseUser);
      callback(userProfile);
    } else {
      callback(null);
    }
  });
};
