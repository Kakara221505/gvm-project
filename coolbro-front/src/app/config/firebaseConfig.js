import { initializeApp } from "firebase/app";
import "firebase/auth"
import '@firebase/firestore'
import firebase, { getApp, getApps } from 'firebase/app';
import 'firebase/firestore';
// import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";


const clientCred = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

const app = !getApps().length ? initializeApp(clientCred) : getApp();
// console.log("APP", app);
const auth = app.name && typeof window !== 'undefined' ? getAuth(app) : null;
//  console.log("APP", auth);

export { app, auth }