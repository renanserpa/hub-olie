import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBTKL9uFL8mwruNSuFaeHQByjSQ6uU3cRA",
  authDomain: "olie-hub.firebaseapp.com",
  projectId: "olie-hub",
  storageBucket: "olie-hub.firebasestorage.app",
  messagingSenderId: "890992175253",
  appId: "1:890992175253:web:2d90ea08f361ec3081539c",
  measurementId: "G-C7N0BK5GKT",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
isSupported().then((ok) => ok && getAnalytics(app));

console.log("🔥 Firebase inicializado com sucesso!");
