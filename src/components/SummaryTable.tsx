import styles from './SummaryTable.module.css'
import type { Barista, Location } from '../data/locations'
import type { LocationResult } from '../types/payroll'
import { formatCurrency } from '../utils/payroll'

type SummaryTableProps = {
  locations: Location[]
  baristas: Barista[]
  results: Record<string, LocationResult>
}

type SummaryRow = {
  baristaId: string
  name: string
  bonus: number
  totals: Record<string, number>
  overall: number
}

export function SummaryTable({ locations, baristas, results }: SummaryTableProps) {
  const hasData = Object.keys(results).length > 0

  if (!hasData) {
    return null
  }

  const rows = buildRows(locations, baristas, results)
  const grandTotals = calculateGrandTotals(rows, locations)

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2>Сводная таблица по всем точкам</h2>
        <p>Бонусы не прибавляются — выделяем старших цветом.</p>
      </div>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Сотрудник</th>
              {locations.map((location) => (
                <th key={location.id}>{location.title}</th>
              ))}
              <th>Сумма</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.baristaId} className={row.bonus > 0 ? styles.bonusRow : undefined}>
                <td>{row.name}</td>
                {locations.map((location) => (
                  <td key={`${row.baristaId}-${location.id}`}>
                    {formatCurrency(row.totals[location.id] ?? 0)}
                  </td>
                ))}
                <td>{formatCurrency(row.overall)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td>Итого</td>
              {locations.map((location) => (
                <td key={`total-${location.id}`}>{formatCurrency(grandTotals.byLocation[location.id] ?? 0)}</td>
              ))}
              <td>{formatCurrency(grandTotals.overall)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  )
}

function buildRows(
  locations: Location[],
  baristas: Barista[],
  results: Record<string, LocationResult>,
): SummaryRow[] {
  const rowsMap = new Map<string, SummaryRow>()

  const addRow = (id: string, name: string, bonus = 0) => {
    if (!rowsMap.has(id)) {
      rowsMap.set(id, {
        baristaId: id,
        name,
        bonus,
        totals: {},
        overall: 0,
      })
    }
  }

  baristas.forEach((barista) => addRow(barista.id, barista.name, barista.bonus))

  Object.values(results).forEach((locationResult) => {
    locationResult.rows.forEach((row) => {
      if (!rowsMap.has(row.baristaId)) {
        addRow(row.baristaId, row.name, 0)
      }
      const target = rowsMap.get(row.baristaId)!
      target.totals[locationResult.locationId] = row.total
    })
  })

  const rows = Array.from(rowsMap.values()).map((row) => {
    const total = locations.reduce((sum, location) => sum + (row.totals[location.id] ?? 0), 0)
    return {
      ...row,
      overall: total,
    }
  })

  return rows.filter((row) => row.overall > 0)
}

function calculateGrandTotals(rows: SummaryRow[], locations: Location[]) {
  const byLocation: Record<string, number> = {}
  let overall = 0

  rows.forEach((row) => {
    locations.forEach((location) => {
      byLocation[location.id] = (byLocation[location.id] ?? 0) + (row.totals[location.id] ?? 0)
    })
    overall += row.overall
  })

  return { byLocation, overall }
}

