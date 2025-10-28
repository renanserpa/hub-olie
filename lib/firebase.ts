// lib/firebase.ts
// FIX: Use namespace imports for Firebase modules to prevent issues with bundlers that may not correctly handle named exports.
import * as firebaseApp from "firebase/app";
import * as firebaseAuth from "firebase/auth";
import * as firebaseFirestore from "firebase/firestore";
import * as firebaseStorage from "firebase/storage";
import * as firebaseAnalytics from "firebase/analytics";

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
const app = !firebaseApp.getApps().length ? firebaseApp.initializeApp(firebaseConfig) : firebaseApp.getApp();

// Inicializações principais
export const db = firebaseFirestore.getFirestore(app);
export const auth = firebaseAuth.getAuth(app);
export const storage = firebaseStorage.getStorage(app);

// Analytics opcional (verifica suporte)
firebaseAnalytics.isSupported().then((supported) => {
  if (supported) {
    const analytics = firebaseAnalytics.getAnalytics(app);
    console.log("📊 Analytics ativo:", analytics.app.name);
  } else {
    console.warn("Analytics não suportado neste ambiente.");
  }
});

console.log("🔥 Firebase inicializado com sucesso!");
