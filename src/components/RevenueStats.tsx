import styles from './RevenueStats.module.css'
import type { LocationResult } from '../types/payroll'
import { formatCurrency } from '../utils/payroll'

type RevenueStatsProps = {
  results: LocationResult[]
}

export function RevenueStats({ results }: RevenueStatsProps) {
  if (!results.length) return null

  const locationStats = results.map((result) => {
    const revenue = result.revenueTotal
    const percentShare = calcShare(result.totals.percent, revenue)
    const wageShare = calcShare(result.totals.total, revenue)
    return {
      id: result.locationId,
      title: result.locationTitle,
      revenue,
      percentShare,
      wageShare,
      percentAmount: result.totals.percent,
      wageAmount: result.totals.total,
    }
  })

  const totals = locationStats.reduce(
    (acc, stat) => {
      acc.revenue += stat.revenue
      acc.percent += stat.percentAmount
      acc.wage += stat.wageAmount
      return acc
    },
    { revenue: 0, percent: 0, wage: 0 },
  )

  return (
    <section className={styles.section}>
      <header className={styles.header}>
        <div>
          <p className={styles.label}>Статистика по выручке</p>
          <h2>Проценты и ЗП как доля revenue</h2>
        </div>
        <div className={styles.summary}>
          <div>
            <span>Проценты, сеть</span>
            <strong>{formatShare(calcShare(totals.percent, totals.revenue))}</strong>
          </div>
          <div>
            <span>ЗП, сеть</span>
            <strong>{formatShare(calcShare(totals.wage, totals.revenue))}</strong>
          </div>
        </div>
      </header>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Точка</th>
              <th>Выручка</th>
              <th>Проценты</th>
              <th>ЗП</th>
            </tr>
          </thead>
          <tbody>
            {locationStats.map((stat) => (
              <tr key={stat.id}>
                <td>{stat.title}</td>
                <td>{formatCurrency(stat.revenue)}</td>
                <td>{formatShare(stat.percentShare)}</td>
                <td>{formatShare(stat.wageShare)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function calcShare(part: number, whole: number): number | null {
  if (!whole || !Number.isFinite(whole)) return null
  return (part / whole) * 100
}

function formatShare(value: number | null): string {
  if (value === null) return '—'
  return `${value.toFixed(1)}%`
}

