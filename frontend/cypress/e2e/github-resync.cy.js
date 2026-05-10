/**
 * E2E Test: GitHub Re-Sync Flow
 * Tests: GitHub repository re-synchronization
 * Requirements: 6.1, 6.2, 6.3, 6.4
 */

describe('GitHub Re-Sync Flow', () => {
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
  })

  it('should successfully re-sync GitHub repositories', () => {
    const initialProjects = [
      {
        _id: 'project-1',
        title: 'Old Repo',
        description: 'An old repository',
        githubRepoId: 111,
        language: 'JavaScript'
      },
      {
        _id: 'project-2',
        title: 'Custom Project',
        description: 'A custom project',
        githubRepoId: null,
        language: 'Python'
      }
    ]

    const syncedProjects = [
      {
        _id: 'project-1',
        title: 'Old Repo',
        description: 'Updated description from GitHub',
        githubRepoId: 111,
        language: 'JavaScript'
      },
      {
        _id: 'project-2',
        title: 'Custom Project',
        description: 'A custom project',
        githubRepoId: null,
        language: 'Python'
      },
      {
        _id: 'project-3',
        title: 'New Repo',
        description: 'A newly created repository',
        githubRepoId: 222,
        language: 'TypeScript'
      }
    ]

    // Mock initial projects list
    cy.intercept('GET', '**/api/projects', {
      statusCode: 200,
      body: initialProjects
    }).as('getInitialProjects')

    cy.visit('/dashboard')
    cy.wait('@getUser')
    cy.contains('Projects').click()
    cy.wait('@getInitialProjects')

    // Verify initial state
    cy.contains('Old Repo').should('be.visible')
    cy.contains('Custom Project').should('be.visible')
    cy.contains('New Repo').should('not.exist')

    // Mock the sync endpoint
    cy.intercept('POST', '**/api/projects/sync', {
      statusCode: 200,
      body: {
        message: 'Repositories synced successfully',
        count: 2,
        projects: syncedProjects
      }
    }).as('syncProjects')

    // Mock the updated projects list
    cy.intercept('GET', '**/api/projects', {
      statusCode: 200,
      body: syncedProjects
    }).as('getUpdatedProjects')

    // Click Re-Sync GitHub button
    cy.contains('button', /re-sync|sync.*github/i).click()

    // Wait for sync to complete
    cy.wait('@syncProjects')
    cy.wait('@getUpdatedProjects')

    // Verify success message
    cy.contains(/success|synced|updated/i, { timeout: 5000 }).should('be.visible')

    // Verify updated projects list
    cy.contains('Old Repo').should('be.visible')
    cy.contains('Custom Project').should('be.visible')
    cy.contains('New Repo').should('be.visible')

    // Verify custom project was preserved
    cy.contains('Custom Project').should('be.visible')
  })

  it('should show loading state during re-sync', () => {
    const projects = [
      {
        _id: 'project-1',
        title: 'Test Repo',
        description: 'A test repository',
        githubRepoId: 111,
        language: 'JavaScript'
      }
    ]

    // Mock projects list
    cy.intercept('GET', '**/api/projects', {
      statusCode: 200,
      body: projects
    }).as('getProjects')

    cy.visit('/dashboard')
    cy.wait('@getUser')
    cy.contains('Projects').click()
    cy.wait('@getProjects')

    // Mock slow sync endpoint
    cy.intercept('POST', '**/api/projects/sync', (req) => {
      req.reply({
        delay: 2000,
        statusCode: 200,
        body: {
          message: 'Repositories synced successfully',
          count: 1,
          projects: projects
        }
      })
    }).as('syncProjects')

    // Click Re-Sync GitHub button
    cy.contains('button', /re-sync|sync.*github/i).click()

    // Verify loading state appears
    cy.get('button').contains(/syncing|loading/i).should('be.visible')
    
    // Wait for sync to complete
    cy.wait('@syncProjects')

    // Verify loading state disappears
    cy.get('button').contains(/syncing|loading/i).should('not.exist')
  })

  it('should handle re-sync errors gracefully', () => {
    const projects = [
      {
        _id: 'project-1',
        title: 'Test Repo',
        description: 'A test repository',
        githubRepoId: 111,
        language: 'JavaScript'
      }
    ]

    // Mock projects list
    cy.intercept('GET', '**/api/projects', {
      statusCode: 200,
      body: projects
    }).as('getProjects')

    cy.visit('/dashboard')
    cy.wait('@getUser')
    cy.contains('Projects').click()
    cy.wait('@getProjects')

    // Mock failed sync endpoint
    cy.intercept('POST', '**/api/projects/sync', {
      statusCode: 500,
      body: {
        message: 'Failed to sync repositories'
      }
    }).as('syncProjectsFailed')

    // Click Re-Sync GitHub button
    cy.contains('button', /re-sync|sync.*github/i).click()

    // Wait for sync to fail
    cy.wait('@syncProjectsFailed')

    // Verify error message
    cy.contains(/error|failed/i, { timeout: 5000 }).should('be.visible')

    // Verify projects list is unchanged
    cy.contains('Test Repo').should('be.visible')
  })

  it('should preserve custom projects during re-sync', () => {
    const initialProjects = [
      {
        _id: 'project-1',
        title: 'GitHub Repo',
        description: 'From GitHub',
        githubRepoId: 111,
        language: 'JavaScript'
      },
      {
        _id: 'project-2',
        title: 'Custom Project 1',
        description: 'Custom project',
        githubRepoId: null,
        language: 'Python'
      },
      {
        _id: 'project-3',
        title: 'Custom Project 2',
        description: 'Another custom project',
        githubRepoId: null,
        language: 'Ruby'
      }
    ]

    const syncedProjects = [
      {
        _id: 'project-1',
        title: 'GitHub Repo',
        description: 'Updated from GitHub',
        githubRepoId: 111,
        language: 'JavaScript'
      },
      {
        _id: 'project-2',
        title: 'Custom Project 1',
        description: 'Custom project',
        githubRepoId: null,
        language: 'Python'
      },
      {
        _id: 'project-3',
        title: 'Custom Project 2',
        description: 'Another custom project',
        githubRepoId: null,
        language: 'Ruby'
      }
    ]

    // Mock initial projects list
    cy.intercept('GET', '**/api/projects', {
      statusCode: 200,
      body: initialProjects
    }).as('getInitialProjects')

    cy.visit('/dashboard')
    cy.wait('@getUser')
    cy.contains('Projects').click()
    cy.wait('@getInitialProjects')

    // Verify all projects are present
    cy.contains('GitHub Repo').should('be.visible')
    cy.contains('Custom Project 1').should('be.visible')
    cy.contains('Custom Project 2').should('be.visible')

    // Mock the sync endpoint
    cy.intercept('POST', '**/api/projects/sync', {
      statusCode: 200,
      body: {
        message: 'Repositories synced successfully',
        count: 1,
        projects: syncedProjects
      }
    }).as('syncProjects')

    // Mock the updated projects list
    cy.intercept('GET', '**/api/projects', {
      statusCode: 200,
      body: syncedProjects
    }).as('getUpdatedProjects')

    // Click Re-Sync GitHub button
    cy.contains('button', /re-sync|sync.*github/i).click()

    // Wait for sync to complete
    cy.wait('@syncProjects')
    cy.wait('@getUpdatedProjects')

    // Verify all custom projects are still present
    cy.contains('Custom Project 1').should('be.visible')
    cy.contains('Custom Project 2').should('be.visible')
    cy.contains('GitHub Repo').should('be.visible')
  })
})
