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

export class Month {
  constructor(public year: number, public month: number) {}

  toLocaleFullMonth(): string {
    return `${localeMonthStrings[this.month]} ${this.year}`;
  }

  getKey(): string {
    return `${this.year}#${this.month}`;
  }

  static fromKey(key: string): Month {
    const parts = key.split('#');

    return new Month(Number(parts[0]), Number(parts[1]));
  }
}
