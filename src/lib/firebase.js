// src/firebase/firebase-config.js
import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyB95Rp0pvwjcFi0dHEvvrRh0svfTkuL7MA",
  authDomain: "ala-laundry-902e5.firebaseapp.com",
  databaseURL: "https://ala-laundry-902e5-default-rtdb.firebaseio.com",
  projectId: "ala-laundry-902e5",
  storageBucket: "ala-laundry-902e5.appspot.com",
  messagingSenderId: "844364387376",
  appId: "1:844364387376:web:6e5cc90231e6186a1ec9f5",
  measurementId: "G-RJYCMM2PLR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Storage and get a reference to the service
export const storage = getStorage(app);

// Export the app instance if needed elsewhere
export default app;