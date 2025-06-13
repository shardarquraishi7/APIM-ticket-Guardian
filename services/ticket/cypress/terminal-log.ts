import { Result } from 'axe-core'

export default function terminalLog(violations: Result[]): void {
  cy.task(
    'log',
    `${violations.length} accessibility violation${violations.length === 1 ? '' : 's'} ${
      violations.length === 1 ? 'was' : 'were'
    } detected`
  )

  const violationData = violations.map(({ id, impact, description, nodes }) => ({
    id,
    impact,
    description,
    nodes: nodes.length
  }))

  cy.task('table', violationData)
  cy.task('outputAxeResults', violationData)
}
