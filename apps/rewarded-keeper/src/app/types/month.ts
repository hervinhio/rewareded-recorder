const localeMonthStrings = [
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
  'November',
  'Decembre',
]

export class Month {
  constructor(public year: number, public month: number) {

  }

  toLocaleFullMonth(): string {
    return `${localeMonthStrings[this.month]} ${this.year}`;
  }
}
