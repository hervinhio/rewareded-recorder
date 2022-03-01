import { addDoc, collection, doc, getDocs, query, setDoc, where } from "firebase/firestore";
import { Publisher } from "../types";
import { db } from "./database";

export class Publishers {
    static CollectionName = 'Publishers';

    static async create(publisher: Publisher): Promise<Publisher> {
        await addDoc(collection(db, Publishers.CollectionName), publisher);
        return publisher;
    }

    static async all(): Promise<Publisher[]> {
        const publishers: Publisher[] = [];
        const q = query(collection(db, Publishers.CollectionName));

        (await getDocs(q)).forEach((doc) => {
            publishers.push({ ...doc.data(), id: doc.id } as Publisher);
        });

        return publishers;
    }

    static async elders(): Promise<Publisher[]> {
        const elders: Publisher[] = [];
        const q = query(collection(db, Publishers.CollectionName), where('isElder', '==', true));

        (await getDocs(q)).forEach((doc) => {
            elders.push({ ...doc.data(), id: doc.id } as Publisher);
        });

        return elders;
    }

    static async byGroupId(groupId: string): Promise<Publisher[]> {
        const publishers: Publisher[] = [];
        const q = query(collection(db, Publishers.CollectionName), where('groupId', '==', groupId));

        (await getDocs(q)).forEach((doc) => {
            publishers.push({ ...doc.data(), id: doc.id } as Publisher);
        });

        return publishers;
    }

    static async unafiliated(): Promise<Publisher[]> {
        return Publishers.byGroupId('unafiliated');
    }

    static async save(publisher: Publisher): Promise<Publisher> {
        await setDoc(doc(db, Publishers.CollectionName, publisher.id || ''), publisher);
        return publisher;
    }
}
