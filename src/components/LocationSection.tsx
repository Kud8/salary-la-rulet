import { FormEvent, useMemo, useState } from 'react'
import styles from './LocationSection.module.css'
import type { Location } from '../data/locations'
import { SENIOR_BONUS } from '../data/locations'

type LocationSectionProps = {
  location: Location
}

export function LocationSection({ location }: LocationSectionProps) {
  const [sheetTab, setSheetTab] = useState(location.sheet.tab)
  const [columnRange, setColumnRange] = useState(location.sheet.range)

  const stats = useMemo(() => {
    if (!location.baristas.length) {
      return { averageRate: 0, minRate: 0, maxRate: 0, seniorCount: 0 }
    }

    const rates = location.baristas.map((barista) => barista.rate)
    const totalRate = rates.reduce((acc, rate) => acc + rate, 0)
    const seniorCount = location.baristas.filter((barista) => barista.role === 'senior').length

    return {
      averageRate: Math.round(totalRate / location.baristas.length),
      minRate: Math.min(...rates),
      maxRate: Math.max(...rates),
      seniorCount,
    }
  }, [location.baristas])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    console.group(`[${location.title}] Расчет`)
    console.log('Google Sheet:', location.sheet.docUrl)
    console.log('Tab:', sheetTab)
    console.log('Диапазон колонок:', columnRange)
    console.log('Бариста (из JSON):', location.baristas)
    console.log('Средняя ставка по точке:', `${stats.averageRate} ₽`)
    console.log('Старшие бариста:', stats.seniorCount)
    console.log('Бонус старшего (₽):', SENIOR_BONUS)
    console.groupEnd()
  }

  const handleReset = () => {
    setSheetTab(location.sheet.tab)
    setColumnRange(location.sheet.range)
  }

  return (
    <section className={styles.card} style={{ borderColor: location.accentColor }}>
      <div className={styles.header}>
        <div>
          <p className={styles.label}>Точка</p>
          <h2>{location.title}</h2>
          <span>{location.address}</span>
        </div>

        <a href={location.sheet.docUrl} className={styles.sheetLink} target="_blank" rel="noreferrer">
          Открыть таблицу
        </a>
      </div>

      <div className={styles.metaRow}>
        <span>{location.baristas.length} бариста</span>
        <span>{stats.seniorCount} старших</span>
        <span>
          {stats.minRate.toLocaleString('ru-RU')}–{stats.maxRate.toLocaleString('ru-RU')} ₽
        </span>
      </div>

      <ul className={styles.baristaList}>
        {location.baristas.map((barista) => (
          <li key={barista.id} className={styles.baristaItem}>
            <div>
              <p className={styles.baristaName}>{barista.name}</p>
              <span className={styles.baristaRole}>
                {barista.role === 'senior' ? 'Старший бариста' : 'Бариста'}
              </span>
            </div>

            <div className={styles.rateBlock}>
              <strong>{barista.rate.toLocaleString('ru-RU')} ₽/ч</strong>
              {barista.role === 'senior' && (
                <span className={styles.bonus}>+ {SENIOR_BONUS.toLocaleString('ru-RU')} ₽ бонус</span>
              )}
            </div>
          </li>
        ))}
      </ul>

      <form className={styles.sheetForm} onSubmit={handleSubmit}>
        <div className={styles.formField}>
          <label htmlFor={`${location.id}-tab`}>Tab (название листа)</label>
          <input
            id={`${location.id}-tab`}
            value={sheetTab}
            onChange={(event) => setSheetTab(event.target.value)}
            placeholder="Например, Ligovka"
          />
        </div>

        <div className={styles.formField}>
          <label htmlFor={`${location.id}-range`}>Диапазон колонок</label>
          <input
            id={`${location.id}-range`}
            value={columnRange}
            onChange={(event) => setColumnRange(event.target.value)}
            placeholder="Например, C:K"
          />
        </div>

        <div className={styles.formActions}>
          <button type="submit" className={styles.submitButton}>
            Считать
          </button>
          <button type="button" className={styles.resetButton} onClick={handleReset}>
            Сбросить
          </button>
        </div>
      </form>
    </section>
  )
}

