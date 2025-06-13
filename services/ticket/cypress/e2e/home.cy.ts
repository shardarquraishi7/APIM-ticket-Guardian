export default describe('Home', () => {
  it('renders a heading', () => {
    cy.visit('/')
    // inject cypress axe -> https://github.com/component-driven/cypress-axe
    cy.injectAxe()
    cy.get('h1').contains('(Insert Homepage Here)')
  })
})
