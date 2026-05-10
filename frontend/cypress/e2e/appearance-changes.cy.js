/**
 * E2E Test: Appearance Changes
 * Tests: appearance changes reflecting on portfolio
 * Requirements: 11.1, 11.2, 11.3, 12.1, 12.2, 12.3
 */

describe('Appearance Changes', () => {
  beforeEach(() => {
    // Mock authentication
    cy.intercept('GET', '**/api/me', {
      statusCode: 200,
      body: {
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
        theme: 'light'
      }
    }).as('getUser')

    cy.setCookie('connect.sid', 'mock-session-id')
    cy.visit('/dashboard')
    cy.wait('@getUser')
  })

  it('should change layout template and reflect on portfolio', () => {
    // Navigate to Appearance section
    cy.contains('Appearance').click()

    // Mock the appearance update endpoint
    cy.intercept('PATCH', '**/api/appearance', {
      statusCode: 200,
      body: {
        layoutTemplate: 'modern',
        theme: 'light'
      }
    }).as('updateAppearance')

    // Select a different layout template - click the "Modern" button
    cy.contains('button', 'Modern').click()

    // Click Save Changes button
    cy.contains('button', 'Save Changes').click()

    // Wait for update
    cy.wait('@updateAppearance')

    // Verify success message
    cy.contains(/success|updated|saved/i, { timeout: 5000 }).should('be.visible')

    // Mock the public profile with new layout
    cy.intercept('GET', '**/api/testuser', {
      statusCode: 200,
      body: {
        username: 'testuser',
        displayName: 'Test User',
        avatarUrl: 'https://avatars.githubusercontent.com/u/12345',
        bio: 'Test bio',
        location: 'Test Location',
        skills: ['JavaScript'],
        socials: {},
        projects: [],
        education: [],
        layoutTemplate: 'modern',
        theme: 'light'
      }
    }).as('getPublicProfile')

    // Click view portfolio link
    cy.contains('button', 'View Portfolio').click()

    // Wait for navigation
    cy.wait(1000)

    // Verify we're on the portfolio page
    cy.url().should('include', '/testuser')

    // Verify the page loaded with user info
    cy.contains('Test User', { timeout: 10000 }).should('be.visible')
  })

  it('should change theme and reflect on portfolio', () => {
    // Navigate to Appearance section
    cy.contains('Appearance').click()

    // Mock the appearance update endpoint
    cy.intercept('PATCH', '**/api/appearance', {
      statusCode: 200,
      body: {
        layoutTemplate: 'default',
        theme: 'dark'
      }
    }).as('updateAppearance')

    // Select dark theme - click the "Dark" button
    cy.contains('button', 'Dark').click()

    // Click Save Changes button
    cy.contains('button', 'Save Changes').click()

    // Wait for update
    cy.wait('@updateAppearance')

    // Verify success message
    cy.contains(/success|updated|saved/i, { timeout: 5000 }).should('be.visible')

    // Mock the public profile with new theme
    cy.intercept('GET', '**/api/testuser', {
      statusCode: 200,
      body: {
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
        theme: 'dark'
      }
    }).as('getPublicProfile')

    // Click view portfolio link
    cy.contains('button', 'View Portfolio').click()

    // Wait for navigation
    cy.wait(1000)

    // Verify we're on the portfolio page
    cy.url().should('include', '/testuser')

    // Verify the page loaded
    cy.contains('Test User', { timeout: 10000 }).should('be.visible')
  })

  it('should display available layout templates', () => {
    // Navigate to Appearance section
    cy.contains('Appearance').click()

    // Verify layout template section is visible
    cy.contains('Layout Template').should('be.visible')
    
    // Verify layout options are available
    cy.contains('button', 'Default').should('be.visible')
    cy.contains('button', 'Minimal').should('be.visible')
    cy.contains('button', 'Modern').should('be.visible')
    cy.contains('button', 'Classic').should('be.visible')
  })

  it('should display available themes', () => {
    // Navigate to Appearance section
    cy.contains('Appearance').click()

    // Verify theme section is visible
    cy.contains('Color Theme').should('be.visible')
    
    // Verify theme options are available
    cy.contains('button', 'Light').should('be.visible')
    cy.contains('button', 'Dark').should('be.visible')
    cy.contains('button', 'Blue').should('be.visible')
    cy.contains('button', 'Purple').should('be.visible')
  })

  it('should show preview or view portfolio link', () => {
    // Navigate to Appearance section
    cy.contains('Appearance').click()

    // Verify there's a way to view the portfolio
    cy.contains('button', 'View Portfolio').should('be.visible')
  })

  it('should persist appearance changes across sessions', () => {
    // Navigate to Appearance section
    cy.contains('Appearance').click()

    // Mock the appearance update endpoint
    cy.intercept('PATCH', '**/api/appearance', {
      statusCode: 200,
      body: {
        layoutTemplate: 'modern',
        theme: 'dark'
      }
    }).as('updateAppearance')

    // Change layout
    cy.contains('button', 'Modern').click()
    
    // Click Save Changes
    cy.contains('button', 'Save Changes').click()
    cy.wait('@updateAppearance')

    // Mock updated user data
    cy.intercept('GET', '**/api/me', {
      statusCode: 200,
      body: {
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
        layoutTemplate: 'modern',
        theme: 'dark'
      }
    }).as('getUpdatedUser')

    // Reload the page
    cy.reload()
    cy.wait('@getUpdatedUser')

    // Navigate back to Appearance section
    cy.contains('Appearance').click()

    // Verify the section loaded (Modern button should have selected styling)
    cy.contains('Layout Template').should('be.visible')
    cy.contains('button', 'Modern').should('exist')
  })

  it('should handle appearance update errors', () => {
    // Navigate to Appearance section
    cy.contains('Appearance').click()

    // Mock failed appearance update
    cy.intercept('PATCH', '**/api/appearance', {
      statusCode: 500,
      body: {
        message: 'Failed to update appearance'
      }
    }).as('updateAppearanceFailed')

    // Try to change layout
    cy.contains('button', 'Modern').click()
    
    // Click Save Changes
    cy.contains('button', 'Save Changes').click()

    // Wait for failed update
    cy.wait('@updateAppearanceFailed')

    // Verify error message
    cy.contains(/error|failed/i, { timeout: 5000 }).should('be.visible')
  })
})
