import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// IMPORTANTE: Substitua pela configuração real do seu projeto Firebase.
// É altamente recomendável usar variáveis de ambiente para isso.
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "your-api-key",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "your-auth-domain",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "your-storage-bucket",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "your-messaging-sender-id",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "your-app-id"
};

// Evita múltiplas inicializações (útil em HMR - Hot Module Replacement)
const app: FirebaseApp = getApps().length > 0 ? getApps()[0]! : initializeApp(firebaseConfig);


// Exporta os serviços do Firebase
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Exibe um aviso no console se estiver usando credenciais de placeholder
if (firebaseConfig.apiKey === "your-api-key") {
    const warningStyle = 'background: #fffbe6; color: #f59e0b; font-size: 14px; padding: 16px; border-radius: 8px; border: 1px solid #fde68a;';
    console.log('%c⚠️ O cliente Firebase não está configurado. Adicione a configuração do seu projeto Firebase para que a aplicação funcione.', warningStyle);
}