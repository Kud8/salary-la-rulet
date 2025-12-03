import { useState } from 'react'
import type { FormEvent } from 'react'
import styles from './LocationSection.module.css'
import type { Location } from '../data/locations'

type LocationSectionProps = {
  location: Location
}

const DEFAULT_RANGE = 'B:K'

export function LocationSection({ location }: LocationSectionProps) {
  const [sheetGid, setSheetGid] = useState(location.gid)
  const [columnRange, setColumnRange] = useState(DEFAULT_RANGE)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    console.group(`[${location.title}] Расчет`)
    console.log('Google Sheet:', `${location.sheetUrl}#gid=${sheetGid}`)
    console.log('gid:', sheetGid)
    console.log('Диапазон колонок:', columnRange)
    console.groupEnd()
  }

  const handleReset = () => {
    setSheetGid(location.gid)
    setColumnRange(DEFAULT_RANGE)
  }

  const sheetLink = `${location.sheetUrl}#gid=${sheetGid}`

  return (
    <section className={styles.card}>
      <div className={styles.header}>
        <div>
          <p className={styles.label}>Точка</p>
          <h2>{location.title}</h2>
        </div>

        <a href={sheetLink} className={styles.sheetLink} target="_blank" rel="noreferrer">
          Открыть таблицу
        </a>
      </div>

      <form className={styles.sheetForm} onSubmit={handleSubmit}>
        <div className={styles.formField}>
          <label htmlFor={`${location.id}-gid`}>ID листа (gid)</label>
          <input
            id={`${location.id}-gid`}
            value={sheetGid}
            onChange={(event) => setSheetGid(event.target.value)}
            placeholder="Например, 1408239064"
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

