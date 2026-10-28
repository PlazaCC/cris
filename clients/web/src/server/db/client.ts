import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'

import * as schema from './schema'

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error('DATABASE_URL não definida (veja clients/web/.env.example)')
}

// neon-http: sem conexão persistente, adequado para funções serverless
export const db = drizzle({ client: neon(databaseUrl), schema })

export type Database = typeof db
