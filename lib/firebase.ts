// lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

// Explicitly import services for their side-effects to ensure registration
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";
import "firebase/analytics";


const firebaseConfig = {
  apiKey: "AIzaSyBTKL9uFL8mwruNSuFaeHQByjSQ6uU3cRA",
  authDomain: "olie-hub.firebaseapp.com",
  projectId: "olie-hub",
  storageBucket: "olie-hub.appspot.com",
  messagingSenderId: "890992175253",
  appId: "1:890992175253:web:2d90ea08f361ec3081539c",
  measurementId: "G-C7N0BK5GKT"
};

// Garantir inicialização única
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Inicializações principais
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Analytics opcional (verifica suporte)
isSupported().then((supported) => {
  if (supported) {
    const analytics = getAnalytics(app);
    console.log("📊 Analytics ativo:", analytics.app.name);
  } else {
    console.warn("Analytics não suportado neste ambiente.");
  }
});

console.log("🔥 Firebase inicializado com sucesso!");