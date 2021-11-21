import { initializeApp } from "firebase/app";
import { connectFirestoreEmulator, doc, DocumentReference, getDoc, getFirestore } from "firebase/firestore"
import { Month, MonthConfig } from "../app/types";

const firebaseConfig = {
  apiKey: "AIzaSyCFeEw-q5Og5fPE0fNCBv6EZAnaLbATltY",
  authDomain: "rewarded-keeper.firebaseapp.com",
  projectId: "rewarded-keeper",
  storageBucket: "rewarded-keeper.appspot.com",
  messagingSenderId: "697083459993",
  appId: "1:697083459993:web:56070001f3a491ca11fb08"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore();
const collectionName = 'months';

connectFirestoreEmulator(db, 'localhost', 8087);

export const getMonthConfigByKey = async (month: Month): Promise<MonthConfig | null> => {
  const docRef = doc(db, collectionName, month.getKey());
  const docSnap = await getDoc<MonthConfig>(docRef as DocumentReference<MonthConfig>);

  if (docSnap.exists()) {
    return docSnap.data();
  }

  return null;
}
