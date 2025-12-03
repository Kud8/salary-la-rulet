import express from 'express'
import { google } from 'googleapis'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

type ServiceAccountKeys = {
  client_email: string
  private_key: string
}

type SheetsRequestBody = {
  spreadsheetUrl?: string
  gid?: string
  range?: string
}

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly']
const PORT = Number(process.env.API_PORT ?? 4000)
const KEYS_PATH = process.env.GOOGLE_APPLICATION_CREDENTIALS ?? path.resolve(process.cwd(), 'keys.json')

const app = express()
app.use(express.json())

let cachedKeys: ServiceAccountKeys | null = null

async function loadServiceAccount(): Promise<ServiceAccountKeys> {
  if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
    return {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }
  }

  if (cachedKeys) {
    return cachedKeys
  }

  const raw = await readFile(KEYS_PATH, 'utf-8')
  const parsed = JSON.parse(raw) as ServiceAccountKeys
  if (!parsed.client_email || !parsed.private_key) {
    throw new Error('keys.json должен содержать client_email и private_key')
  }

  cachedKeys = {
    client_email: parsed.client_email,
    private_key: parsed.private_key.replace(/\\n/g, '\n'),
  }
  return cachedKeys
}

async function getSheetsClient() {
  const keys = await loadServiceAccount()
  const auth = new google.auth.JWT({
    email: keys.client_email,
    key: keys.private_key,
    scopes: SCOPES,
  })
  await auth.authorize()
  return google.sheets({ version: 'v4', auth })
}

function extractSpreadsheetId(url: string): string | null {
  const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/)
  return match?.[1] ?? null
}

function escapeSheetTitle(title: string) {
  return title.replace(/'/g, "''")
}

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.post('/api/sheets/read', async (req, res) => {
  const { spreadsheetUrl, gid, range }: SheetsRequestBody = req.body ?? {}

  if (!spreadsheetUrl || !gid || !range) {
    return res.status(400).json({ error: 'Нужны параметры spreadsheetUrl, gid и range' })
  }

  const spreadsheetId = extractSpreadsheetId(spreadsheetUrl)
  if (!spreadsheetId) {
    return res.status(400).json({ error: 'Не удалось получить spreadsheetId из ссылки' })
  }

  const sheetId = Number(gid)
  if (!Number.isFinite(sheetId)) {
    return res.status(400).json({ error: 'gid должен быть числом' })
  }

  try {
    const sheets = await getSheetsClient()
    const metadata = await sheets.spreadsheets.get({
      spreadsheetId,
      fields: 'sheets.properties(sheetId,title)',
    })

    const targetSheet = metadata.data.sheets?.find(
      (sheet) => sheet.properties?.sheetId === sheetId && !!sheet.properties?.title,
    )

    if (!targetSheet || !targetSheet.properties?.title) {
      return res.status(404).json({ error: `Лист с gid=${gid} не найден` })
    }

    const sheetTitle = targetSheet.properties.title
    const normalizedRange = `'${escapeSheetTitle(sheetTitle)}'!${range}`

    const valuesResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: normalizedRange,
      valueRenderOption: 'UNFORMATTED_VALUE',
      dateTimeRenderOption: 'FORMATTED_STRING',
    })

    const values = valuesResponse.data.values ?? []
    const rowCount = values.length
    const columnCount = values[0]?.length ?? 0

    res.json({
      spreadsheetId,
      sheetTitle,
      gid: sheetId,
      range: normalizedRange,
      rowCount,
      columnCount,
      values,
      fetchedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Ошибка чтения Google Sheet', error)
    const googleMessage =
      typeof error === 'object' && error && 'response' in error
        ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (((error as any).response?.data?.error?.message as string | undefined) ??
            ((error as any).response?.statusText as string | undefined))
        : undefined
    const fallbackMessage = error instanceof Error ? error.message : 'Неизвестная ошибка'
    const message = googleMessage ?? fallbackMessage
    const status =
      typeof error === 'object' && error && 'response' in error
        ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ((error as any).response?.status as number | undefined)
        : undefined

    res.status(status && status >= 400 ? status : 500).json({
      error: message || 'Не удалось прочитать данные из Google Sheets',
    })
  }
})

app.listen(PORT, () => {
  console.log(`[api] http://localhost:${PORT}`)
})

