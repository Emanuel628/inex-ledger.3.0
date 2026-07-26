import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const dataDir = path.resolve(process.cwd(), 'server', 'data')
const dataFile = path.join(dataDir, 'auth-store.json')

const emptyStore = {
  users: [],
  sessions: [],
  businesses: [],
}

export async function readStore() {
  try {
    const raw = await readFile(dataFile, 'utf8')
    return { ...emptyStore, ...JSON.parse(raw) }
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return structuredClone(emptyStore)
    }

    throw error
  }
}

export async function writeStore(store) {
  await mkdir(dataDir, { recursive: true })
  await writeFile(dataFile, `${JSON.stringify(store, null, 2)}\n`)
}

export async function updateStore(updater) {
  const store = await readStore()
  const result = await updater(store)
  await writeStore(store)
  return result
}
