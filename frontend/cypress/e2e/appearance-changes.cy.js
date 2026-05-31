/**
 * E2E Test: Appearance Changes
 * Tests: appearance changes reflecting on portfolio and dashboard state
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
  socials: {},
  layoutTemplate: 'default',
  theme: 'light',
}

const publicProfile = (overrides = {}) => ({
  username: 'testuser',
  displayName: 'Test User',
  avatarUrl: 'https://avatars.githubusercontent.com/u/12345',
  bio: 'Test bio',
  location: 'Test Location',
  skills: ['JavaScript'],
  socials: {},
  projects: [],
  education: [],
  layoutTemplate: 'default',
  theme: 'light',
  ...overrides,
})

describe('Appearance Changes', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/api/me', {
      statusCode: 200,
      body: baseUser,
    }).as('getUser')

    cy.setCookie('connect.sid', 'mock-session-id')
    cy.visit('/dashboard')
    cy.wait('@getUser')
  })

  it('should change layout template and reflect on portfolio', () => {
    cy.contains('Appearance').click()

    cy.intercept('PATCH', '**/api/appearance', {
      statusCode: 200,
      body: {
        layoutTemplate: 'modern',
        theme: 'light',
      },
    }).as('updateAppearance')

    cy.contains('button', 'Modern').click()
    cy.contains('button', 'Save Changes').click()
    cy.wait('@updateAppearance')
    cy.contains(/success|updated|saved/i, { timeout: 5000 }).should('be.visible')

    cy.intercept('GET', '**/api/testuser', {
      statusCode: 200,
      body: publicProfile({ layoutTemplate: 'modern' }),
    }).as('getPublicProfile')

    cy.contains('button', 'View Portfolio').click()
    cy.url().should('include', '/testuser')
    cy.contains('Test User', { timeout: 10000 }).should('be.visible')
    cy.contains('Hi, I\'m Test User').should('be.visible')
  })

  it('should change theme and apply theme class on portfolio', () => {
    cy.contains('Appearance').click()

    cy.intercept('PATCH', '**/api/appearance', {
      statusCode: 200,
      body: {
        layoutTemplate: 'default',
        theme: 'dark',
      },
    }).as('updateAppearance')

    cy.contains('button', 'Dark').click()
    cy.contains('button', 'Save Changes').click()
    cy.wait('@updateAppearance')
    cy.contains(/success|updated|saved/i, { timeout: 5000 }).should('be.visible')

    cy.intercept('GET', '**/api/testuser', {
      statusCode: 200,
      body: publicProfile({ theme: 'dark' }),
    }).as('getPublicProfile')

    cy.contains('button', 'View Portfolio').click()
    cy.url().should('include', '/testuser')
    cy.get('.theme-dark', { timeout: 10000 }).should('exist')
  })

  it('should keep saved theme selected after portfolio edit round-trip', () => {
    cy.contains('Appearance').click()

    cy.intercept('PATCH', '**/api/appearance', {
      statusCode: 200,
      body: {
        layoutTemplate: 'default',
        theme: 'purple',
      },
    }).as('updateAppearance')

    cy.contains('button', 'Purple').click()
    cy.contains('button', 'Save Changes').click()
    cy.wait('@updateAppearance')

    cy.intercept('GET', '**/api/testuser', {
      statusCode: 200,
      body: publicProfile({ theme: 'purple' }),
    }).as('getPublicProfile')

    cy.contains('button', 'View Portfolio').click()
    cy.url().should('include', '/testuser')
    cy.get('.theme-purple', { timeout: 10000 }).should('exist')

    cy.intercept('GET', '**/api/me', {
      statusCode: 200,
      body: { ...baseUser, theme: 'purple' },
    }).as('getUserAfterEdit')

    cy.get('[aria-label="Edit Portfolio"]').should('be.visible').click()
    cy.url().should('include', '/dashboard')
    cy.wait('@getUserAfterEdit')

    cy.contains('Appearance').click()
    cy.contains('button', 'Purple').should('have.class', 'border-primary')
  })

  it('should display available layout templates', () => {
    cy.contains('Appearance').click()
    cy.contains('Layout Template').should('be.visible')
    cy.contains('button', 'Default').should('be.visible')
    cy.contains('button', 'Minimal').should('be.visible')
    cy.contains('button', 'Modern').should('be.visible')
    cy.contains('button', 'Classic').should('be.visible')
  })

  it('should display available themes', () => {
    cy.contains('Appearance').click()
    cy.contains('Color Theme').should('be.visible')
    cy.contains('button', 'Light').should('be.visible')
    cy.contains('button', 'Dark').should('be.visible')
    cy.contains('button', 'Midnight').should('be.visible')
    cy.contains('button', 'Nord').should('be.visible')
    cy.contains('button', 'Green').should('be.visible')
    cy.contains('button', 'Rose').should('be.visible')
    cy.contains('button', 'Purple').should('be.visible')
  })

  it('should show preview or view portfolio link', () => {
    cy.contains('Appearance').click()
    cy.contains('button', 'View Portfolio').should('be.visible')
  })

  it('should persist appearance changes across sessions', () => {
    cy.contains('Appearance').click()

    cy.intercept('PATCH', '**/api/appearance', {
      statusCode: 200,
      body: {
        layoutTemplate: 'modern',
        theme: 'dark',
      },
    }).as('updateAppearance')

    cy.contains('button', 'Modern').click()
    cy.contains('button', 'Dark').click()
    cy.contains('button', 'Save Changes').click()
    cy.wait('@updateAppearance')

    cy.intercept('GET', '**/api/me', {
      statusCode: 200,
      body: {
        ...baseUser,
        layoutTemplate: 'modern',
        theme: 'dark',
      },
    }).as('getUpdatedUser')

    cy.reload()
    cy.wait('@getUpdatedUser')

    cy.contains('Appearance').click()
    cy.contains('button', 'Modern').should('have.class', 'border-primary')
    cy.contains('button', 'Dark').should('have.class', 'border-primary')
  })

  it('should handle appearance update errors', () => {
    cy.contains('Appearance').click()

    cy.intercept('PATCH', '**/api/appearance', {
      statusCode: 500,
      body: {
        message: 'Failed to update appearance',
      },
    }).as('updateAppearanceFailed')

    cy.contains('button', 'Modern').click()
    cy.contains('button', 'Save Changes').click()
    cy.wait('@updateAppearanceFailed')
    cy.contains(/error|failed/i, { timeout: 5000 }).should('be.visible')
  })
})
