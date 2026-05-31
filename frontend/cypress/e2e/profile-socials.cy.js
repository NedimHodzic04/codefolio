/**
 * E2E Test: Social Links on Dashboard
 * Tests: existing links load in form and partial saves do not wipe other links
 */

const baseUser = {
  _id: 'test-user-id',
  githubId: '12345',
  username: 'testuser',
  displayName: 'Test User',
  email: 'test@example.com',
  avatarUrl: 'https://avatars.githubusercontent.com/u/12345',
  bio: 'Test bio',
  location: 'Test Location',
  skills: ['JavaScript'],
  socials: {
    linkedin: '',
    twitter: '',
    website: '',
  },
  layoutTemplate: 'default',
  theme: 'light',
}

describe('Profile Social Links', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/api/me', {
      statusCode: 200,
      body: baseUser,
    }).as('getUser')

    cy.setCookie('connect.sid', 'mock-session-id')
    cy.visit('/dashboard')
    cy.wait('@getUser')
  })

  it('should display existing social links in the form', () => {
    cy.intercept('GET', '**/api/me', {
      statusCode: 200,
      body: {
        ...baseUser,
        socials: {
          linkedin: 'https://linkedin.com/in/testuser',
          twitter: 'https://twitter.com/testuser',
          website: 'https://testuser.dev',
        },
      },
    }).as('getUserWithSocials')

    cy.reload()
    cy.wait('@getUserWithSocials')

    cy.get('#linkedin').should('have.value', 'https://linkedin.com/in/testuser')
    cy.get('#twitter').should('have.value', 'https://twitter.com/testuser')
    cy.get('#website').should('have.value', 'https://testuser.dev')
  })

  it('should preserve other social links when saving one field at a time', () => {
    cy.intercept('PATCH', '**/api/socials', {
      statusCode: 200,
      body: {
        socials: {
          linkedin: 'https://linkedin.com/in/testuser',
          twitter: '',
          website: '',
        },
      },
    }).as('saveLinkedin')

    cy.get('#linkedin').type('https://linkedin.com/in/testuser')
    cy.contains('button', 'Save Social Links').click()
    cy.wait('@saveLinkedin')
    cy.contains(/success|updated|saved/i, { timeout: 5000 }).should('be.visible')
    cy.get('#linkedin').should('have.value', 'https://linkedin.com/in/testuser')

    cy.intercept('PATCH', '**/api/socials', (req) => {
      expect(req.body.linkedin).to.eq('https://linkedin.com/in/testuser')
      expect(req.body.twitter).to.eq('https://twitter.com/testuser')

      req.reply({
        statusCode: 200,
        body: {
          socials: {
            linkedin: 'https://linkedin.com/in/testuser',
            twitter: 'https://twitter.com/testuser',
            website: '',
          },
        },
      })
    }).as('saveTwitter')

    cy.get('#twitter').type('https://twitter.com/testuser')
    cy.contains('button', 'Save Social Links').click()
    cy.wait('@saveTwitter')

    cy.get('#linkedin').should('have.value', 'https://linkedin.com/in/testuser')
    cy.get('#twitter').should('have.value', 'https://twitter.com/testuser')
  })
})
