import { createSlice } from "@reduxjs/toolkit";
import { AttendanceRecord } from "./attendance-record";
import { Timestamp, addDoc, collection, deleteDoc, doc, getDocs, query, updateDoc, where, orderBy } from "firebase/firestore";
import { omit } from "lodash";
import { db } from "./database";
import { store } from "./store";
import { Events } from "../types";
import { getLastTwelveMonths } from "../utils";
import { Congregations } from "./congregations";

export interface AttendanceRecordState {
    records: AttendanceRecord[];
    forModification?: AttendanceRecord;
    forDeletion?: AttendanceRecord;
}

export class AttendanceRecords {
    private static CollectionName = 'AttendanceRecords';
    private static InitialState: AttendanceRecordState = {
        records: [],
    }
    static slice = createSlice({
        name: 'AttendanceRecords',
        initialState: AttendanceRecords.InitialState,
        reducers: {
            added: (state, { payload }) => {
                state.records.push(payload);
            },
            removed: (state, { payload }) => {
                state.records = [ ...state.records.filter(r => r.id !== payload.id )];
            },
            updated: (state, { payload }) => {
                state.records = [ ...state.records.map(r => {
                    if (r.id === payload.id) {
                        return payload;
                    }

                    return r;
                })]
            },
            loaded: (state, { payload }) => {
                state.records = payload || [];
            },
            setForModification: (state, { payload }) => {
                state.forModification = payload;
            },
            setForDeletion: (state, { payload }) => {
                state.forDeletion = payload;
            }
        }
    });

    static async update(record: AttendanceRecord): Promise<void> {
        await updateDoc(doc(db, `${AttendanceRecords.CollectionName}/${record.id}`), { ...omit(record, ['id'])});
        store.dispatch(AttendanceRecords.slice.actions.updated(record));
        Events.emit('attendance_record_updated', {...record });
    }

    static async create(record: AttendanceRecord): Promise<void> {
        const congregationId = Congregations.getActiveCongregationId();
        const data = congregationId
          ? { ...omit(record, ['id']), congregationId }
          : omit(record, ['id']);
        const docRef = await addDoc(collection(db, `${AttendanceRecords.CollectionName}`), data);
        const createdRecord = { ...record, id: docRef.id, ...(congregationId ? { congregationId } : {}) };
        store.dispatch(AttendanceRecords.slice.actions.added(createdRecord));
        Events.emit('attendance_record_updated', createdRecord);
    }

    static async load(): Promise<void> {
        const months = getLastTwelveMonths(new Date());
        const records: AttendanceRecord[] = [];
        const activeCongregationId = Congregations.getActiveCongregationId();
        const congregationConstraints = activeCongregationId
            ? [where('congregationId', '==', activeCongregationId)]
            : [];
        const q = query(collection(db, AttendanceRecords.CollectionName), ...congregationConstraints, where('monthId', 'in', months.map(m => m.getKey())), orderBy('date', 'asc'));

        (await getDocs(q)).forEach(doc => {
            records.push({ ...doc.data(), id: doc.id } as AttendanceRecord);
        });

        store.dispatch(AttendanceRecords.slice.actions.loaded(records));
    }

    static async delete(record: AttendanceRecord): Promise<void> {
        await deleteDoc(doc(db, `${AttendanceRecords.CollectionName}/${record.id}`));
        store.dispatch(AttendanceRecords.slice.actions.removed(record));
        store.dispatch(AttendanceRecords.slice.actions.setForDeletion(undefined));
    }

    static async existsForDate(date: Timestamp): Promise<boolean> {
        const q = query(collection(db, AttendanceRecords.CollectionName), where('date', '==', date.toDate()));
        const docs = await getDocs(q);

        return !docs.empty;
    }
}
