import { initializeApp } from "firebase/app";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore"
import { environment } from "../../environments/environment";

initializeApp(environment.firebaseConfig);

export const db = getFirestore();

(() => {
    if (!environment.production) {
        connectFirestoreEmulator(db, 'localhost', 8087);
    }
})();
