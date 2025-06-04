import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBrQMmBXJm7yCXJdZPWfEkYbDKIHbEbxVk",
  authDomain: "apartment-management-f4c4f.firebaseapp.com",
  projectId: "apartment-management-f4c4f",
  storageBucket: "apartment-management-f4c4f.appspot.com",
  messagingSenderId: "1098374471196",
  appId: "1:1098374471196:web:2c9d6e6f2f9b9b9b9b9b9b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Firestore instance
export const db = getFirestore(app);

// Get Auth instance
export const auth = getAuth(app);

export default app;
