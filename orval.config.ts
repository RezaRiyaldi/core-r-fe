
import 'dotenv/config'
import { defineConfig } from 'orval'

const openApiUrl = process.env.OPENAPI_URL

if (!openApiUrl) {
    throw new Error('OPENAPI_URL belum diatur di file .env')
}

export default defineConfig({
    coreR: {
        input: {
            target: openApiUrl,
        },
        output: {
            target: './src/api/generated/core-r.ts',
            schemas: './src/api/generated/models',
            client: 'axios',
            mode: 'single',
        },
    },
})
