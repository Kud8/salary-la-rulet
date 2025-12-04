export type BaristaBreakdown = {
  baristaId: string
  name: string
  base: number
  percent: number
  total: number
}

export type LocationResult = {
  locationId: string
  locationTitle: string
  sheetTitle: string
  range: string
  rowCount?: number
  rows: BaristaBreakdown[]
  totals: {
    base: number
    percent: number
    total: number
  }
  fetchedAt: string
}

