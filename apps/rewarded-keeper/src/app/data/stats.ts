import { doc, setDoc } from "firebase/firestore";
import { db } from "./database";

export interface Stats {
    gone: number;
    newComers: number;
    disfellowshiped: number;
    newPublishers: number;
}


export class StatsUtils {
    public static reset(): Promise<void>  {
        return setDoc(doc(db, 'Stats/unique'), {
            disfellowshiped: 0,
            gone: 0,
            newComers: 0,
            newPublishers: 0,
        });
    }
}
