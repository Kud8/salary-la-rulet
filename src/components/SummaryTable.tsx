import styles from './SummaryTable.module.css'
import type { Barista, Location } from '../data/locations'
import type { LocationResult } from '../types/payroll'
import { formatCurrency } from '../utils/payroll'

type BonusAdjustment = {
  amount: number
  note: string
}

type SummaryTableProps = {
  locations: Location[]
  baristas: Barista[]
  results: Record<string, LocationResult>
  adjustments: Record<string, BonusAdjustment>
  onAdjustmentChange: (baristaId: string, partial: Partial<BonusAdjustment>) => void
}

type SummaryRow = {
  baristaId: string
  name: string
  bonus: number
  totals: Record<string, number>
  overall: number
}

export function SummaryTable({
  locations,
  baristas,
  results,
  adjustments,
  onAdjustmentChange,
}: SummaryTableProps) {
  const hasData = Object.keys(results).length > 0

  if (!hasData) {
    return null
  }

  const rows = buildRows(locations, baristas, results)
  const grandTotals = calculateGrandTotals(rows, locations)
  const bonusTotal = rows.reduce((sum, row) => sum + (adjustments[row.baristaId]?.amount ?? 0), 0)

  const handleExport = () => {
    const header = [
      'Бариста',
      ...locations.map((location) => location.title),
      'Бонус',
      'Сумма',
      'Комментарий',
    ]

    const csvRows = [
      header,
      ...rows.map((row) => {
        const adjustment = adjustments[row.baristaId] ?? { amount: 0, note: '' }
        const totalWithBonus = row.overall + adjustment.amount

        return [
          row.name,
          ...locations.map((location) => row.totals[location.id] ?? 0),
          adjustment.amount,
          totalWithBonus,
          adjustment.note,
        ]
      }),
      [
        'Итого',
        ...locations.map((location) => grandTotals.byLocation[location.id] ?? 0),
        bonusTotal,
        grandTotals.overall + bonusTotal,
        '',
      ],
    ]

    const csvContent = csvRows
      .map((row) =>
        row
          .map((cell) => {
            if (typeof cell === 'number') {
              return cell.toString().replace('.', ',')
            }
            const stringCell = cell ?? ''
            const needsQuotes = /[",;\n]/.test(stringCell)
            const escaped = stringCell.replace(/"/g, '""')
            return needsQuotes ? `"${escaped}"` : escaped
          })
          .join(';'),
      )
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `payroll-summary-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2>Сводная таблица по всем точкам</h2>
        <button type="button" className={styles.exportButton} onClick={handleExport}>
          Выгрузить CSV
        </button>
      </div>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
          <tr>
            <th>Сотрудник</th>
            {locations.map((location) => (
                <th key={location.id}>{location.title}</th>
            ))}
            <th>Бонус</th>
            <th>Сумма</th>
            <th>Комментарий</th>
          </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const adjustment = adjustments[row.baristaId] ?? { amount: 0, note: '' }
              const totalWithBonus = row.overall + adjustment.amount

              return (
                  <tr key={row.baristaId} className={row.bonus > 0 ? styles.bonusRow : undefined}>
                    <td>{row.name}</td>
                    {locations.map((location) => (
                        <td key={`${row.baristaId}-${location.id}`}>
                          {formatCurrency(row.totals[location.id] ?? 0)}
                        </td>
                    ))}
                    <td className={styles.bonusCell}>
                      <input
                          type="number"
                          inputMode="numeric"
                          className={styles.numberInput}
                          value={adjustment.amount}
                          onChange={(event) =>
                              onAdjustmentChange(row.baristaId, {amount: Number(event.target.value)})
                          }
                      />
                    </td>
                    <td className={styles.totalCell}>{formatCurrency(totalWithBonus)}</td>
                    <td className={styles.noteCell}>
                      <input
                          type="text"
                          className={styles.noteInput}
                          placeholder="Комментарий"
                          value={adjustment.note}
                          onChange={(event) => onAdjustmentChange(row.baristaId, {note: event.target.value})}
                      />
                    </td>
                  </tr>
              )
            })}
          </tbody>
          <tfoot>
          <tr>
            <td>Итого</td>
            {locations.map((location) => (
                <td key={`total-${location.id}`}>{formatCurrency(grandTotals.byLocation[location.id] ?? 0)}</td>
            ))}
            <td>{formatCurrency(bonusTotal)}</td>
            <td>{formatCurrency(grandTotals.overall + bonusTotal)}</td>
            <td/>
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

  return rows
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

