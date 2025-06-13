import 'cypress-axe'

interface Violation {
  id: string
  impact: string
  description: string
  nodes: string[]
}

function log(violations: Violation[]) {
  try {
    cy.task('log', `${violations.length} accessibility violation(s) detected`)

    const violationData = violations.map(({ id, impact, description, nodes }: any) => ({
      id,
      impact,
      description,
      nodes: nodes.length
    }))

    cy.task('table', violationData)
  } catch {
    console.error('Cypress function call has failed.')
  }
}

afterEach(() => {
  // test accessibility and output results to the console
  cy.checkA11y(undefined, undefined, log, true)
})
