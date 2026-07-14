import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB_q274Saubl-6K03LA5O4EiCJrDFNK_JA",
  authDomain: "praklyne.firebaseapp.com",
  projectId: "praklyne",
  storageBucket: "praklyne.firebasestorage.app",
  messagingSenderId: "756028124724",
  appId: "1:756028124724:ios:17736136af554a01bca461",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
