import { doc, DocumentReference, getDoc, setDoc } from 'firebase/firestore';
import { Month, MonthConfig } from '../types';
import { db } from './database';

const collectionName = 'months';

export const getMonthConfigByKey = async (
  month: Month
): Promise<MonthConfig | null> => {
  const docRef = doc(db, collectionName, month.getKey());
  const docSnap = await getDoc(
    docRef as DocumentReference<MonthConfig>
  );

  if (docSnap.exists()) {
    return docSnap.data();
  }

  return null;
};

export const setMonthConfig = async (
  config: MonthConfig
): Promise<MonthConfig | null> => {
  await setDoc(doc(db, collectionName, config.id), {
    formUrl: config.formUrl,
  });

  return config;
};
