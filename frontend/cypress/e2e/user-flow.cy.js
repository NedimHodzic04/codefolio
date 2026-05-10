/**
 * E2E Test: Complete User Flow
 * Tests: login → dashboard → edit profile → view portfolio
 * Requirements: All
 */

describe('Complete User Flow', () => {
  beforeEach(() => {
    // Mock the authentication
    cy.intercept('GET', '**/api/me', {
      statusCode: 200,
      body: {
        _id: 'test-user-id',
        githubId: '12345',
        username: 'testuser',
        displayName: 'Test User',
        email: 'test@example.com',
        avatarUrl: 'https://avatars.githubusercontent.com/u/12345',
        bio: 'Original bio',
        location: 'Original Location',
        skills: ['JavaScript', 'React'],
        socials: {
          linkedin: 'https://linkedin.com/in/testuser',
          twitter: 'https://twitter.com/testuser',
          website: 'https://testuser.com'
        },
        layoutTemplate: 'default',
        theme: 'light'
      }
    }).as('getUser')
  })

  it('should complete full user journey from login to portfolio view', () => {
    // Step 1: Visit login page and verify it loads
    cy.visit('/login')
    cy.contains(/log in with github|sign in with github/i).should('be.visible')

    // Step 2: Mock GitHub OAuth callback and navigate to dashboard
    cy.setCookie('connect.sid', 'mock-session-id')
    
    // Step 3: Navigate to dashboard
    cy.visit('/dashboard')
    cy.wait('@getUser')
    
    // Verify dashboard loads
    cy.contains('Test User').should('be.visible')
    cy.contains('testuser').should('be.visible')

    // Step 3: Edit profile - update bio
    cy.intercept('PATCH', '**/api/profile', {
      statusCode: 200,
      body: {
        bio: 'Updated bio for testing',
        location: 'Original Location'
      }
    }).as('updateProfile')

    // Find and edit bio - click Edit button
    cy.contains('Bio').parent().within(() => {
      cy.contains('button', 'Edit').click()
    })
    
    cy.get('#bio').clear().type('Updated bio for testing')
    cy.contains('button', 'Save').click()
    cy.wait('@updateProfile')

    // Verify success message
    cy.contains(/success|saved|updated/i, { timeout: 5000 }).should('be.visible')

    // Step 4: Edit location
    cy.intercept('PATCH', '**/api/profile', {
      statusCode: 200,
      body: {
        bio: 'Updated bio for testing',
        location: 'New Test City'
      }
    }).as('updateLocation')

    cy.contains('Location').parent().within(() => {
      cy.contains('button', 'Edit').click()
    })
    
    cy.get('#location').clear().type('New Test City')
    cy.contains('button', 'Save').click()
    cy.wait('@updateLocation')

    // Step 5: Add a skill
    cy.intercept('POST', '**/api/skills', {
      statusCode: 200,
      body: {
        skills: ['JavaScript', 'React', 'Cypress']
      }
    }).as('addSkill')

    // Scroll to Skills section and add a skill
    cy.contains('Skills').scrollIntoView()
    cy.contains('Skills').should('be.visible')
    
    // Find the input in the Skills card and type
    cy.contains('Skills').parent().parent().find('input').type('Cypress{enter}')
    cy.wait('@addSkill')
    cy.contains('Cypress').should('be.visible')

    // Step 6: View portfolio
    cy.intercept('GET', '**/api/users/testuser', {
      statusCode: 200,
      body: {
        username: 'testuser',
        displayName: 'Test User',
        avatarUrl: 'https://avatars.githubusercontent.com/u/12345',
        bio: 'Updated bio for testing',
        location: 'New Test City',
        skills: ['JavaScript', 'React', 'Cypress'],
        socials: {
          linkedin: 'https://linkedin.com/in/testuser',
          twitter: 'https://twitter.com/testuser',
          website: 'https://testuser.com'
        },
        projects: [],
        education: [],
        layoutTemplate: 'default',
        theme: 'light'
      }
    }).as('getPublicProfile')

    // Navigate to portfolio - look for link in navbar or elsewhere
    cy.visit('/testuser')
    
    // Verify we're on the portfolio page
    cy.url().should('include', '/testuser')
    
    // Verify updated content is visible
    cy.contains('Updated bio for testing', { timeout: 10000 }).should('be.visible')
    cy.contains('New Test City').should('be.visible')
    cy.contains('Cypress').should('be.visible')
  })

  it('should redirect unauthenticated users to login', () => {
    // Override the auth intercept to return 401
    cy.intercept('GET', '**/api/me', {
      statusCode: 401,
      body: { message: 'Unauthorized' }
    }).as('getUnauthorized')

    cy.visit('/dashboard')
    cy.wait('@getUnauthorized')
    
    // Should redirect to login
    cy.url().should('include', '/login')
  })
})
