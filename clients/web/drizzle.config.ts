import { defineConfig } from 'drizzle-kit'

try {
  process.loadEnvFile()
} catch {
  // sem .env: usa as variáveis já exportadas no ambiente (CI/Vercel)
}

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/server/db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? '',
  },
  strict: true,
})
