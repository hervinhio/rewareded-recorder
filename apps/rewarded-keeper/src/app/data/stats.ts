import axios, { AxiosError } from 'axios';
import { Flags } from './flags';

export interface Stats {
    gone: number;
    newComers: number;
    disfellowshiped: number;
    newPublishers: number;
    underRestrictions: number;
    baptized: number;
    blamed: number;
    families: number;
}

export class StatsUtils {
    public static async reset(): Promise<void>  {
      try {
        return await axios.post('/api/stats/reset', null, {
          headers: { Authorization: localStorage.getItem('jwt') },
        }).then(() => {
        });
      } catch (error) {
        Flags.raiseError('Unable to reset stats ' + (error as AxiosError).message);
      }
    }

    public static async update(stats: Stats): Promise<void> {
      try {
        return await axios.patch('/api/stats', stats, {
          headers: { Authorization: localStorage.getItem('jwt') },
        }).then(() => {
        });
      } catch (error) {
        Flags.raiseError('Unable to update stats ' + (error as AxiosError).message);
      }
    }
}
