export type Location = {
  id: string
  title: string
  sheetUrl: string
  gid: string
  rate: number;
  percent: number;
  range: string;
}

export type Barista = {
  id: string
  name: string
  bonus: number
}

export const locations: Location[] = [
  {
    id: 'bvp',
    title: 'БВП 47А',
    sheetUrl: 'https://docs.google.com/spreadsheets/d/1wdsUzr3XTMNgz1BBuWewYIQaaxAiFSL-kTv_-QdQ4lw/',
    gid: '1408239064',
    rate: 200,
    percent: 4,
    range: 'AA:BF'
  },
  {
    id: 'gagarina',
    title: 'Гагарина',
    sheetUrl: 'https://docs.google.com/spreadsheets/d/10WRC0dn2rQ9somCAiv2fKBZ2rjTnsKL0RvtM-VZE0Pg',
    gid: '1075859178',
    rate: 140,
    percent: 4,
    range: 'AB:AZ'
  },
  {
    id: 'magnit',
    title: 'Магнит',
    sheetUrl: 'https://docs.google.com/spreadsheets/d/1rN9E0S2iJV4KVY5-6EXAy22QyNR4bE74nf2W0894q2M',
    gid: '1943259619',
    rate: 150,
    percent: 2,
    range: 'AB:BB'
  },
]

export const baristas: Barista[] = [
  { id: 'alina', name: 'Алина', bonus: 0 },
  { id: 'angelina', name: 'Ангелина', bonus: 5000 },
  { id: 'anya', name: 'Аня', bonus: 0 },
  { id: 'vika', name: 'Вика', bonus: 6000 },
  { id: 'viktoria', name: 'Виктория', bonus: 0 },
  { id: 'dasha', name: 'Даша', bonus: 0 },
  { id: 'diana', name: 'Диана', bonus: 0 },
  { id: 'kirill-b', name: 'Кирилл Б', bonus: 0 },
  { id: 'kirill-k', name: 'Кирилл К', bonus: 0 },
  { id: 'ksyusha', name: 'Ксюша', bonus: 0 },
  { id: 'lesha', name: 'Леша', bonus: 5000 },
  { id: 'ruslan', name: 'Руслан', bonus: 0 },
]