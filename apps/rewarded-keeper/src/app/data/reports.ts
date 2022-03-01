import { addDoc, collection, doc, getDocs, query, setDoc, Timestamp, where } from "firebase/firestore";
import { Repport } from "../types";
import { db } from "./database";

export class Repports {
    static CollectionName = 'Repports';
    
    static async create(repport: Repport): Promise<Repport> {
        await addDoc(collection(db, Repports.CollectionName), { ...repport, date: Timestamp.now() });
        return repport;
    }

    static async update(repport: Repport): Promise<Repport> {
        await setDoc(doc(db, Repports.CollectionName, repport.id), repport);
        return repport;
    }
    
    static async byPublisherId(publisherId: string | undefined): Promise<Repport[]> {
        if (!publisherId) return [];
        
        const repports: Repport[] = [];
        const q = query(collection(db, Repports.CollectionName), where('publisherId', '==', publisherId));

        (await getDocs(q)).forEach((doc) => {
            repports.push({ ...doc.data(), id: doc.id } as Repport);
        });

        return repports;
    }

    static async byMonthId(monthId: string | undefined): Promise<Repport[]> {
        if (!monthId) return [];
        
        const repports: Repport[] = [];
        const q = query(collection(db, Repports.CollectionName), where('monthId', '==', monthId));

        (await getDocs(q)).forEach((doc) => {
            repports.push({ ...doc.data(), id: doc.id } as Repport);
        });

        return repports;
    }
}
