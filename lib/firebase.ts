// FIX: Switched to Firebase v9 compat libraries to resolve module export errors.
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/storage';
import 'firebase/compat/analytics';
import { getFirestore } from "firebase/firestore";

// Configuração real do projeto Firebase "olie-hub"
const firebaseConfig = {
  apiKey: "AIzaSyBTKL9uFL8mwruNSuFaeHQByjSQ6uU3cRA",
  authDomain: "olie-hub.firebaseapp.com",
  projectId: "olie-hub",
  storageBucket: "olie-hub.appspot.com",
  messagingSenderId: "890992175253",
  appId: "1:890992175253:web:2d90ea08f361ec3081539c",
  measurementId: "G-C7N0BK5GKT"
};

// Evita múltiplas inicializações e garante que a instância do app seja capturada.
const app = !firebase.apps.length ? firebase.initializeApp(firebaseConfig) : firebase.app();


// Exporta os serviços do Firebase, passando a instância do app explicitamente.
// Isso garante que tanto a API modular (Firestore) quanto a de compatibilidade (Auth, etc.) usem o mesmo app.
export const db = getFirestore(app);
export const auth = firebase.auth(app);
export const storage = firebase.storage(app);
export const analytics = firebase.analytics(app);