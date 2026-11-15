import { MockRepository } from './mockRepository'
import type { DataRepository } from './repository'

// Swap this single line to switch data sources (e.g. new ApiRepository(import.meta.env.VITE_API_URL)).
export const repository: DataRepository = new MockRepository()
