import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "./database";

export interface Stats {
    gone: number;
    newComers: number;
    disfellowshiped: number;
    newPublishers: number;
    underRestrictions: number;
    baptized: number;
    blamed: number;
    families: number;
    auxiliaryPioneersCount: number;
    auxiliaryPioneersIds: string[];
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
            auxiliaryPioneersCount: 0,
            auxiliaryPioneersIds: [],
        });
    }

    public static update(stats: Stats): Promise<void> {
        return setDoc(doc(db, 'Stats/unique'), { ...stats });
    }

    /**
     * Adds a publisher to the auxiliary pioneers list if they've met their goal and aren't already tracked.
     * Updates both the count and the IDs array.
     * 
     * @param publisherId - The ID of the publisher who met their auxiliary pioneer goal
     * @returns Promise<void>
     */
    public static async addAuxiliaryPioneerAchievement(publisherId: string): Promise<void> {
        try {
            const statsRef = doc(db, 'Stats/unique');
            const statsSnap = await getDoc(statsRef);
            
            let currentStats: Stats;
            if (statsSnap.exists()) {
                currentStats = statsSnap.data() as Stats;
            } else {
                // Initialize stats if they don't exist
                currentStats = {
                    gone: 0,
                    newComers: 0,
                    disfellowshiped: 0,
                    newPublishers: 0,
                    underRestrictions: 0,
                    baptized: 0,
                    blamed: 0,
                    families: 0,
                    auxiliaryPioneersCount: 0,
                    auxiliaryPioneersIds: [],
                };
            }

            // Ensure auxiliaryPioneersIds exists and is an array
            if (!currentStats.auxiliaryPioneersIds) {
                currentStats.auxiliaryPioneersIds = [];
            }

            // Only add if the publisher isn't already in the list
            if (!currentStats.auxiliaryPioneersIds.includes(publisherId)) {
                currentStats.auxiliaryPioneersIds.push(publisherId);
                currentStats.auxiliaryPioneersCount = currentStats.auxiliaryPioneersIds.length;
                
                await setDoc(statsRef, currentStats);
            }
        } catch (error) {
            console.error('Error updating auxiliary pioneer stats:', error);
            throw error;
        }
    }
}
