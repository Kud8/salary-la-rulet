export type BaristaRole = 'barista' | 'senior'

export type Barista = {
  id: string
  name: string
  rate: number
  role: BaristaRole
}

export type Location = {
  id: string
  title: string
  address: string
  accentColor: string
  baristas: Barista[]
  sheet: {
    docUrl: string
    tab: string
    range: string
  }
}

export const SENIOR_BONUS = 5000

const BASE_SHEET_URL =
  'https://docs.google.com/spreadsheets/d/1PayrollSpreadsheetIdExample/edit#gid=0'

export const locations: Location[] = [
  {
    id: 'ligovka',
    title: 'Лиговский пр., 45',
    address: 'Ежедневно 08:00–22:00',
    accentColor: '#ffd7cc',
    sheet: {
      docUrl: BASE_SHEET_URL,
      tab: 'Ligovka',
      range: 'B:K',
    },
    baristas: [
      { id: 'lig-anna', name: 'Анна Петрова', rate: 550, role: 'senior' },
      { id: 'lig-kostya', name: 'Костя Сидоров', rate: 480, role: 'barista' },
      { id: 'lig-lera', name: 'Лера Фомина', rate: 470, role: 'barista' },
      { id: 'lig-misha', name: 'Миша Орлов', rate: 460, role: 'barista' },
    ],
  },
  {
    id: 'sadovaya',
    title: 'Малая Садовая, 12',
    address: 'Будни 07:30–21:00 · Выходные 09:00–23:00',
    accentColor: '#ffe9a7',
    sheet: {
      docUrl: BASE_SHEET_URL,
      tab: 'Sadovaya',
      range: 'C:N',
    },
    baristas: [
      { id: 'sad-ira', name: 'Ирина Гордеева', rate: 560, role: 'senior' },
      { id: 'sad-pavel', name: 'Павел Котов', rate: 505, role: 'barista' },
      { id: 'sad-olya', name: 'Оля Брусникина', rate: 495, role: 'barista' },
    ],
  },
  {
    id: 'new-holland',
    title: 'Новая Голландия',
    address: 'Уличный павильон · Погода решает смены',
    accentColor: '#d6f5ff',
    sheet: {
      docUrl: BASE_SHEET_URL,
      tab: 'Holland',
      range: 'B:H',
    },
    baristas: [
      { id: 'hol-dima', name: 'Дима Яковлев', rate: 540, role: 'senior' },
      { id: 'hol-liza', name: 'Лиза Румянцева', rate: 500, role: 'barista' },
      { id: 'hol-taya', name: 'Тая Ким', rate: 490, role: 'barista' },
    ],
  },
]

