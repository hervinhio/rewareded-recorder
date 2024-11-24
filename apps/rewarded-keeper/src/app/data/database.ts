import { initializeApp } from 'firebase/app';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { environment } from '../../environments/environment';

initializeApp(environment.firebaseConfig);

export const db = getFirestore();

(() => {
  if (!environment.production) {
    const host = globalThis.android ? '10.0.2.2' : 'localhost';
    connectFirestoreEmulator(db, host, 8089);
  }
})();
