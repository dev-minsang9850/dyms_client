// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// 필요하면 storage, messaging 추가

const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "...",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const firebaseAuth = getAuth(app);
export const firebaseDb = getFirestore(app);
