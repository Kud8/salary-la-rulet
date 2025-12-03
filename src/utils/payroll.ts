import type { Barista, Location } from '../data/locations'
import type { BaristaBreakdown, LocationResult } from '../types/payroll'

const TABLE_ROWS = {
  base: 0,
  percent: 1,
  date: 3,
  name: 6,
} as const

const NORMALIZE_NAME_REGEX = /[\s]+/g

type CalculateLocationResultParams = {
  location: Location
  sheetTitle: string
  range: string
  values: unknown[][]
  baristas: Barista[]
}

type MutableBreakdown = BaristaBreakdown & {
  bonus?: number
}

export function calculateLocationResult({
  location,
  sheetTitle,
  range,
  values,
  baristas,
}: CalculateLocationResultParams): LocationResult {
  const normalizedBaristas = new Map<string, Barista>()
  baristas.forEach((barista) => {
    normalizedBaristas.set(normalizeName(barista.name), barista)
  })

  const rowsMap = new Map<string, MutableBreakdown>()

  const columnCount = values[0]?.length ?? 0
  const unknownNames = new Set<string>()

  for (let columnIndex = 0; columnIndex < columnCount; columnIndex += 1) {
    const rawName = values[TABLE_ROWS.name]?.[columnIndex]
    const normalized = normalizeName(rawName)

    if (!normalized) {
      continue
    }

    const matchedBarista = normalizedBaristas.get(normalized)
    if (!matchedBarista) {
      unknownNames.add(formatName(rawName))
    }

    const baristaId = matchedBarista?.id ?? `custom:${normalized}`
    const baristaName = matchedBarista?.name ?? formatName(rawName)

    const breakdown =
      rowsMap.get(baristaId) ?? createEmptyBreakdown(baristaId, baristaName)

    const base = parseNumber(values[TABLE_ROWS.base]?.[columnIndex])
    const percent = parseNumber(values[TABLE_ROWS.percent]?.[columnIndex])
    const total = base + percent

    breakdown.base += base
    breakdown.percent += percent
    breakdown.total += total

    rowsMap.set(baristaId, breakdown)
  }

  if (unknownNames.size > 0) {
    console.warn(
      `[${location.title}] не найдены бариста в JSON: ${Array.from(
        unknownNames,
      ).join(', ')}`,
    )
  }

  const rows = Array.from(rowsMap.values()).map((row) => ({
    ...row,
    base: roundCurrency(row.base),
    percent: roundCurrency(row.percent),
    total: roundCurrency(row.total),
  }))

  const totals = rows.reduce(
    (acc, row) => {
      acc.base += row.base
      acc.percent += row.percent
      acc.total += row.total
      return acc
    },
    { base: 0, percent: 0, total: 0 },
  )

  return {
    locationId: location.id,
    locationTitle: location.title,
    sheetTitle,
    range,
    rows,
    totals: {
      base: roundCurrency(totals.base),
      percent: roundCurrency(totals.percent),
      total: roundCurrency(totals.total),
    },
    fetchedAt: new Date().toISOString(),
  }
}

function createEmptyBreakdown(baristaId: string, name: string): MutableBreakdown {
  return {
    baristaId,
    name,
    base: 0,
    percent: 0,
    total: 0,
  }
}

function normalizeName(value: unknown): string {
  if (typeof value !== 'string') {
    return ''
  }

  return value
    .trim()
    .toLowerCase()
    .replace(NORMALIZE_NAME_REGEX, ' ')
}

function formatName(value: unknown): string {
  if (typeof value !== 'string') {
    return 'Без имени'
  }

  const lower = value.trim().toLowerCase()

  if (!lower) {
    return 'Без имени'
  }

  return lower
    .split(' ')
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(' ')
}

function parseNumber(value: unknown): number {
  if (typeof value === 'number') {
    return value
  }

  if (typeof value === 'string') {
    const normalized = value.replace(',', '.')
    const parsed = Number(normalized)
    return Number.isNaN(parsed) ? 0 : parsed
  }

  return 0
}

function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 10) / 10
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('ru-RU', {
    maximumFractionDigits: value % 1 === 0 ? 0 : 1,
  }).format(value)
}

