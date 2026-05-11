/**
 * E2E Test: Project Management
 * Tests: add custom project → edit → delete
 * Requirements: 4.1, 4.2, 5.1, 5.2, 7.1, 7.2, 8.1, 8.2
 */

describe('Project Management', () => {
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

    // Mock initial projects list (empty)
    cy.intercept('GET', '**/api/projects', {
      statusCode: 200,
      body: []
    }).as('getProjects')

    cy.setCookie('connect.sid', 'mock-session-id')
    cy.visit('/dashboard')
    cy.wait('@getUser')
  })

  it('should add a custom project', () => {
    const newProject = {
      _id: 'project-1',
      title: 'My Custom Project',
      description: 'A test project description',
      techStack: ['React', 'Node.js'],
      liveDemo: 'https://example.com',
      imageUrl: 'https://example.com/image.png',
      githubRepoId: null
    }

    // Mock the POST request
    cy.intercept('POST', '**/api/projects', {
      statusCode: 201,
      body: newProject
    }).as('createProject')

    // Mock GET to return the new project after creation
    cy.intercept('GET', '**/api/projects', {
      statusCode: 200,
      body: [newProject]
    }).as('getProjectsAfterCreate')

    // Navigate to Projects section
    cy.contains('Projects').click()
    cy.wait(500) // Wait for section to load

    // Click Add Custom Project button
    cy.contains('button', 'Add Custom Project').click()
    cy.wait(500) // Wait for dialog to open

    // Fill out the form using correct IDs
    cy.get('#add-title').type(newProject.title)
    cy.get('#add-description').type(newProject.description)
    cy.get('#add-liveDemo').type(newProject.liveDemo)
    cy.get('#add-imageUrl').type(newProject.imageUrl)

    // Submit the form - find the button inside the dialog
    cy.get('[role="dialog"]').within(() => {
      cy.contains('button', 'Create Project').click()
    })
    cy.wait('@createProject')

    // Verify success message
    cy.contains(/success|added|created/i, { timeout: 5000 }).should('be.visible')

    // Wait for the list to refresh
    cy.wait(1000)

    // Verify project appears in the list
    cy.contains(newProject.title).should('be.visible')
    cy.contains(newProject.description).should('be.visible')
  })

  it('should edit an existing project', () => {
    const existingProject = {
      _id: 'project-1',
      title: 'Original Title',
      description: 'Original description',
      techStack: ['React'],
      liveDemo: 'https://original.com',
      githubRepoId: null
    }

    const updatedProject = {
      ...existingProject,
      title: 'Updated Title',
      description: 'Updated description',
      liveDemo: 'https://updated.com'
    }

    // Mock projects list with existing project
    cy.intercept('GET', '**/api/projects', {
      statusCode: 200,
      body: [existingProject]
    }).as('getProjectsWithData')

    cy.visit('/dashboard')
    cy.wait('@getUser')
    cy.contains('Projects').click()
    cy.wait('@getProjectsWithData')

    // Mock the PATCH request
    cy.intercept('PATCH', `**/api/projects/${existingProject._id}`, {
      statusCode: 200,
      body: updatedProject
    }).as('updateProject')

    // Mock GET to return updated data after the edit
    cy.intercept('GET', '**/api/projects', {
      statusCode: 200,
      body: [updatedProject]
    }).as('getProjectsAfterUpdate')

    // Click edit button - find it by text
    cy.contains(existingProject.title).should('be.visible')
    cy.get('button').contains('Edit').first().click()

    cy.wait(500) // Wait for dialog to open

    // Update the fields using correct IDs for edit dialog
    cy.get('#edit-title').clear().type(updatedProject.title)
    cy.get('#edit-description').clear().type(updatedProject.description)
    cy.get('#edit-liveDemo').clear().type(updatedProject.liveDemo)

    // Save changes
    cy.contains('button', 'Save Changes').click()
    cy.wait('@updateProject')

    // Verify success message
    cy.contains(/success|updated|saved/i, { timeout: 5000 }).should('be.visible')

    // Wait for refetch
    cy.wait(1000)

    // Verify updated content
    cy.contains(updatedProject.title).should('be.visible')
    cy.contains(updatedProject.description).should('be.visible')
  })

  it('should delete a project with confirmation', () => {
    const projectToDelete = {
      _id: 'project-1',
      title: 'Project to Delete',
      description: 'This will be deleted',
      techStack: ['React'],
      githubRepoId: null
    }

    // Mock projects list
    cy.intercept('GET', '**/api/projects', {
      statusCode: 200,
      body: [projectToDelete]
    }).as('getProjectsWithData')

    cy.visit('/dashboard')
    cy.wait('@getUser')
    cy.contains('Projects').click()
    cy.wait('@getProjectsWithData')

    // Mock the DELETE request
    cy.intercept('DELETE', `**/api/projects/${projectToDelete._id}`, {
      statusCode: 200,
      body: { message: 'Project deleted' }
    }).as('deleteProject')

    // Mock GET to return empty array after deletion
    cy.intercept('GET', '**/api/projects', {
      statusCode: 200,
      body: []
    }).as('getProjectsAfterDelete')

    // Click delete button - find it by text
    cy.contains(projectToDelete.title).should('be.visible')
    cy.get('button').contains('Delete').first().click()

    cy.wait(500) // Wait for dialog to open

    // Confirm deletion in dialog
    cy.get('[role="dialog"]').within(() => {
      cy.contains('button', 'Delete').click()
    })
    cy.wait('@deleteProject')

    // Verify success message
    cy.contains(/success|deleted|removed/i, { timeout: 5000 }).should('be.visible')

    // Wait for refetch
    cy.wait(1000)

    // Verify project is removed from list
    cy.contains(projectToDelete.title).should('not.exist')
  })

  it('should cancel project deletion', () => {
    const project = {
      _id: 'project-1',
      title: 'Project to Keep',
      description: 'This will not be deleted',
      techStack: ['React'],
      githubRepoId: null
    }

    // Mock projects list
    cy.intercept('GET', '**/api/projects', {
      statusCode: 200,
      body: [project]
    }).as('getProjectsWithData')

    cy.visit('/dashboard')
    cy.wait('@getUser')
    cy.contains('Projects').click()
    cy.wait('@getProjectsWithData')

    // Click delete button - find it by text
    cy.contains(project.title).should('be.visible')
    cy.get('button').contains('Delete').first().click()

    cy.wait(500) // Wait for dialog to open

    // Cancel deletion
    cy.get('[role="dialog"]').within(() => {
      cy.contains('button', 'Cancel').click()
    })

    // Verify project still exists
    cy.contains(project.title).should('be.visible')
  })

  it('should toggle project visibility', () => {
    const visibleProject = {
      _id: 'project-1',
      title: 'Visible Project',
      description: 'This project is visible',
      techStack: ['React'],
      isVisible: true,
      githubRepoId: null
    }

    // Mock projects list
    cy.intercept('GET', '**/api/projects', {
      statusCode: 200,
      body: [visibleProject]
    }).as('getProjectsWithData')

    cy.visit('/dashboard')
    cy.wait('@getUser')
    cy.contains('Projects').click()
    cy.wait('@getProjectsWithData')

    // Mock the visibility toggle request
    cy.intercept('PATCH', `**/api/projects/${visibleProject._id}/visibility`, {
      statusCode: 200,
      body: {
        message: 'Project hidden successfully',
        project: { ...visibleProject, isVisible: false }
      }
    }).as('toggleVisibility')

    // Mock GET to return updated project after toggle
    cy.intercept('GET', '**/api/projects', {
      statusCode: 200,
      body: [{ ...visibleProject, isVisible: false }]
    }).as('getProjectsAfterToggle')

    // Find and click the visibility switch
    cy.contains(visibleProject.title).should('be.visible')
    cy.get(`[id^="visibility-"]`).first().click()
    cy.wait('@toggleVisibility')

    // Verify success message
    cy.contains(/hidden|success/i, { timeout: 5000 }).should('be.visible')

    // Wait for refetch
    cy.wait(1000)

    // Verify "Hidden" badge appears
    cy.contains('Hidden').should('be.visible')
  })

  it('should show hidden projects with reduced opacity', () => {
    const hiddenProject = {
      _id: 'project-1',
      title: 'Hidden Project',
      description: 'This project is hidden',
      techStack: ['React'],
      isVisible: false,
      githubRepoId: null
    }

    // Mock projects list with hidden project
    cy.intercept('GET', '**/api/projects', {
      statusCode: 200,
      body: [hiddenProject]
    }).as('getProjectsWithData')

    cy.visit('/dashboard')
    cy.wait('@getUser')
    cy.contains('Projects').click()
    cy.wait('@getProjectsWithData')

    // Verify project is visible in dashboard (even though hidden from public)
    cy.contains(hiddenProject.title).should('be.visible')
    
    // Verify "Hidden" badge is shown
    cy.contains('Hidden').should('be.visible')
    
    // Verify the card has reduced opacity class
    cy.contains(hiddenProject.title)
      .parents('[class*="Card"]')
      .should('have.class', 'opacity-60')
  })
})

