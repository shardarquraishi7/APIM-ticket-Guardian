import { defineConfig } from 'cypress'
import fs from 'node:fs'

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      on('task', {
        log(message) {
          console.log(message)
          return null
        },
        table(message) {
          console.table(message)
          return null
        },
        outputAxeResults(results = []) {
          if (process.env.GITHUB_OUTPUT) {
            fs.writeFileSync(process.env.GITHUB_OUTPUT, `axeResults=${JSON.stringify(results)}`)
          }
          return null
        }
      })
      config.env.NODE_ENV = process.env.NODE_ENV
      return config
    },
    baseUrl: 'http://local.telus.com:3000',
    specPattern: 'cypress/{e2e,integration}/**/*.{cy,spec}.{js,jsx,ts,tsx}'
  }
})
