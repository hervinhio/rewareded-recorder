import { collection, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from ".";
import { User } from "../types";

export class Users {
    static CollectionName = 'Users';

    static async getOne(id: string): Promise<User | null> {
        const userDoc = await getDoc(doc(collection(db, Users.CollectionName), id));

        if (userDoc.exists()) {
            return userDoc.data() as User;
        }

        return null;
    }

    static async create(user: User): Promise<User> {
        user.permissions = [];
        user.validated = false;

        await setDoc(doc(collection(db, Users.CollectionName), user.id), user);
        return user;
    }
}
