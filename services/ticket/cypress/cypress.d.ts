export declare global {
  namespace Cypress {
    interface Chainable {
      visitWithLocale: (url: string, options: any) => Chainable<Element>
    }
  }
}
