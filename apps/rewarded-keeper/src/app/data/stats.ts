import { doc, setDoc } from "firebase/firestore";
import { db } from "./database";

export interface Stats {
    gone: number;
    newComers: number;
    disfellowshiped: number;
    newPublishers: number;
    underRestrictions: number;
    baptized: number;
}

export class StatsUtils {
    public static reset(): Promise<void>  {
        return setDoc(doc(db, 'Stats/unique'), {
            disfellowshiped: 0,
            gone: 0,
            newComers: 0,
            newPublishers: 0,
            underRestrictions: 0,
            baptized: 0,
        });
    }

    public static update(stats: Stats): Promise<void> {
        return setDoc(doc(db, 'Stats/unique'), { ...stats });
    }
}
