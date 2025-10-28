// services/authService.ts
// FIX: Switched to Firebase v9 compat libraries and namespaced API for auth functions.
import type firebase from 'firebase/compat/app';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
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
  // FIX: Use namespaced auth method.
  const userCredential = await auth.signInWithEmailAndPassword(email, password);
  // FIX: The user object on the credential can be null with the compat API.
  if (!userCredential.user) {
    throw new Error('User authentication failed.');
  }
  return await getUserProfile(userCredential.user);
};

export const logout = async (): Promise<void> => {
  // FIX: Use namespaced auth method.
  await auth.signOut();
};

// FIX: Use firebase.User as the type for the firebaseUser parameter.
export const getUserProfile = async (firebaseUser: firebase.User): Promise<AuthUser> => {
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
  // FIX: Use namespaced auth method.
  return auth.onAuthStateChanged(async (firebaseUser) => {
    if (firebaseUser) {
      const userProfile = await getUserProfile(firebaseUser);
      callback(userProfile);
    } else {
      callback(null);
    }
  });
};