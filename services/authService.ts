import { db, auth } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
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
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  if (!userCredential.user) {
    throw new Error('User authentication failed.');
  }
  return await getUserProfile(userCredential.user);
};

export const logout = async (): Promise<void> => {
  await signOut(auth);
};

export const getUserProfile = async (firebaseUser: FirebaseUser): Promise<AuthUser> => {
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
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      const userProfile = await getUserProfile(firebaseUser);
      callback(userProfile);
    } else {
      callback(null);
    }
  });
};