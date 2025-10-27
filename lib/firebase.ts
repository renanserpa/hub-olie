import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

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

// Evita múltiplas inicializações (útil em HMR - Hot Module Replacement)
const app: FirebaseApp = getApps().length > 0 ? getApps()[0]! : initializeApp(firebaseConfig);


// Exporta os serviços do Firebase
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);