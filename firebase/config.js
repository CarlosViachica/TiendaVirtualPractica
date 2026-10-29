import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

export const firebaseConfig = {
  apiKey: "AIzaSyCA1Dqs4MacpQLq8jPFEmBZ8EOHmyfLGAw",
  authDomain: "tiendavirtual-242e5.firebaseapp.com",
  projectId: "tiendavirtual-242e5",
  storageBucket: "tiendavirtual-242e5.firebasestorage.app",
  messagingSenderId: "791048208202",
  appId: "1:791048208202:web:ec3484dc04c559d7ffcbb3",
  measurementId: "G-PBVBC6Z9R4",
};

export const isFirebaseConfigured = Object.values(firebaseConfig).every(
  (value) => value && !String(value).startsWith("YOUR_")
);

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
