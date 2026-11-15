import type { Dataset } from '../domain/types'

/**
 * The ONLY way the app gets data. Today: MockRepository (in-memory).
 * Tomorrow: ApiRepository that fetches a regional Dataset snapshot from a backend which
 * ingests ASSIST agreements, UC InfoCenter "Transfers by Major", and college schedule feeds.
 * Keep the Dataset shape stable; add lazy/fine-grained methods here when data grows.
 */
export interface DataRepository {
  load(): Promise<Dataset>
}
