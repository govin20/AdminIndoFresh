// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBlb4PYD9vUP1QdGcOMhRckeL9QFIywuP0',
  authDomain: 'indofresh-fc226.firebaseapp.com',
  projectId: 'indofresh-fc226',
  storageBucket: 'indofresh-fc226.appspot.com',
  messagingSenderId: '504050591085',
  appId: '1:504050591085:web:8770251b68ee48aba5e664',
  measurementId: 'G-679DBB4W89',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
