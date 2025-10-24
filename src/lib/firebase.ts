import { initializeApp, getApps, getApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAbJ-XmKOAG5H_UGfe837FugGeOkxJsHd4",
  authDomain: "artistlist-ef142.firebaseapp.com",
  projectId: "artistlist-ef142",
  storageBucket: "artistlist-ef142.firebasestorage.app",
  messagingSenderId: "88675009321",
  appId: "1:88675009321:web:9101a114f3ed681b212d38",
  measurementId: "G-D3ZXTW1JWN"
};

// Initialize Firebase (only once)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const storage = getStorage(app);

export { app, storage };

