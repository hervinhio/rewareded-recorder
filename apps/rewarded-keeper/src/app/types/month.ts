import { store } from "../data";

export const localeMonthStrings = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Decembre',
];

export const localeShortMonthStrings = [
  'Jan.',
  'Fév.',
  'Mars',
  'Avr.',
  'Mai',
  'Juin',
  'Juil.',
  'Août',
  'Sep.',
  'Oct.',
  'Nov.',
  'Dec.',
]

export class Month {
  constructor(public year: number, public month: number) {}

  toLocaleFullMonth(): string {
    return store.getState().config.useShortenedMonths ?
      `${localeShortMonthStrings[this.month]} ${this.year%2000}` : `${localeMonthStrings[this.month]} ${this.year}`;
  }

  getKey(): string {
    return `${this.year}#${this.month}`;
  }

  static fromKey(key: string): Month {
    const parts = key.split('#');

    return new Month(Number(parts[0]), Number(parts[1]));
  }
}
