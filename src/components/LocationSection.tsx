import { useState } from 'react'
import type { FormEvent } from 'react'
import styles from './LocationSection.module.css'
import type { Barista, Location } from '../data/locations'
import type { LocationResult } from '../types/payroll'
import { calculateLocationResult, formatCurrency } from '../utils/payroll'

type LocationSectionProps = {
  location: Location
  baristas: Barista[]
  onResult: (locationId: string, result: LocationResult) => void
}

type SheetsReadResponse = {
  spreadsheetId: string
  sheetTitle: string
  gid: number
  range: string
  rowCount: number
  columnCount: number
  values: unknown[][]
  fetchedAt: string
}

export function LocationSection({ location, baristas, onResult }: LocationSectionProps) {
  const [sheetGid, setSheetGid] = useState(location.gid)
  const [columnRange, setColumnRange] = useState(location.range)
  const [isLoading, setIsLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [result, setResult] = useState<LocationResult | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatusMessage(null)
    setErrorMessage(null)

    if (!sheetGid.trim() || !columnRange.trim()) {
      setErrorMessage('Нужны и gid, и диапазон')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/sheets/read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          spreadsheetUrl: location.sheetUrl,
          gid: sheetGid.trim(),
          range: columnRange.trim(),
        }),
      })

      const rawBody = await response.text()

      if (!response.ok) {
        let message = 'Не удалось прочитать таблицу'
        try {
          const parsed = JSON.parse(rawBody) as { error?: string }
          if (parsed?.error) {
            message = parsed.error
          } else if (rawBody) {
            message = rawBody
          }
        } catch {
          if (rawBody) {
            message = rawBody
          }
        }

        throw new Error(message)
      }

      const data = JSON.parse(rawBody) as SheetsReadResponse

      const locationResult = calculateLocationResult({
        location,
        sheetTitle: data.sheetTitle,
        range: columnRange.trim(),
        values: data.values,
        baristas,
      })

      console.group(`[${location.title}] Google Sheets`)
      console.log('Sheet title:', data.sheetTitle)
      console.log('Диапазон:', locationResult.range)
      console.log('Строк / колонок:', data.rowCount, data.columnCount)
      console.log('Сводка:', locationResult)
      console.groupEnd()

      setStatusMessage(`Получено ${data.rowCount} строк из «${data.sheetTitle}»`)
      setResult(locationResult)
      onResult(location.id, locationResult)
    } catch (error) {
      console.error(`Ошибка чтения листа ${location.title}`, error)
      setErrorMessage(error instanceof Error ? error.message : 'Ошибка чтения таблицы')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setSheetGid(location.gid)
    setColumnRange(location.range)
    setStatusMessage(null)
    setErrorMessage(null)
    setResult(null)
  }

  const sheetLink = `${location.sheetUrl}#gid=${sheetGid}`

  return (
    <section className={styles.card}>
      <div className={styles.header}>
        <button
          type="button"
          className={styles.toggle}
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
        >
            <h2>{location.title}</h2>
          <span className={styles.chevron} data-open={isOpen} />
        </button>

        <a href={sheetLink} className={styles.sheetLink} target="_blank" rel="noreferrer">
          Открыть таблицу
        </a>
      </div>

      {isOpen && (
        <div className={styles.body}>
          <form className={styles.sheetForm} onSubmit={handleSubmit}>
            <div className={styles.compactInputs}>
              <label className={styles.compactField} htmlFor={`${location.id}-gid`}>
                <span>ID листа (gid)</span>
                <input
                  id={`${location.id}-gid`}
                  value={sheetGid}
                  onChange={(event) => setSheetGid(event.target.value)}
                  placeholder="1408239064"
                />
              </label>

              <label className={styles.compactField} htmlFor={`${location.id}-range`}>
                <span>Диапазон</span>
                <input
                  id={`${location.id}-range`}
                  value={columnRange}
                  onChange={(event) => setColumnRange(event.target.value)}
                  placeholder="C:K"
                />
              </label>
            </div>

            <div className={styles.formActions}>
              <button type="submit" className={styles.submitButton} disabled={isLoading}>
                {isLoading ? 'Читаем...' : 'Считать'}
              </button>
              <button type="button" className={styles.resetButton} onClick={handleReset} disabled={isLoading}>
                Сбросить
              </button>
            </div>

            <div className={styles.statusRow}>
              {statusMessage && <span className={styles.statusMessage}>{statusMessage}</span>}
              {errorMessage && <span className={styles.statusError}>{errorMessage}</span>}
            </div>
          </form>

          {result && (
            <div className={styles.resultBlock}>
              <div className={styles.resultMeta}>
                <span>Лист «{result.sheetTitle}»</span>
                <span>Диапазон {result.range}</span>
                <span>Обновлено {new Date(result.fetchedAt).toLocaleString('ru-RU')}</span>
              </div>

              <div className={styles.tableWrapper}>
                <table className={styles.resultTable}>
                  <thead>
                    <tr>
                      <th>Сотрудник</th>
                      <th>Основа</th>
                      <th>Проценты</th>
                      <th>Сумма</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.rows.map((row) => (
                      <tr key={row.baristaId}>
                        <td>
                          {row.name}
                        </td>
                        <td>{formatCurrency(row.base)}</td>
                        <td>{formatCurrency(row.percent)}</td>
                        <td>{formatCurrency(row.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td>Итого</td>
                      <td>{formatCurrency(result.totals.base)}</td>
                      <td>{formatCurrency(result.totals.percent)}</td>
                      <td>{formatCurrency(result.totals.total)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  )
}

