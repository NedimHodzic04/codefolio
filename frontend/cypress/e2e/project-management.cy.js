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

    // Navigate to Projects section
    cy.contains('Projects').click()

    // Click Add Custom Project button
    cy.contains('button', /add.*project/i).click()

    // Fill out the form
    cy.get('input[name="title"], input[placeholder*="title" i]').type(newProject.title)
    cy.get('textarea[name="description"], textarea[placeholder*="description" i]').type(newProject.description)
    cy.get('input[name="liveDemo"], input[placeholder*="demo" i], input[placeholder*="url" i]').first().type(newProject.liveDemo)

    // Submit the form
    cy.contains('button', /save|create|add/i).click()
    cy.wait('@createProject')

    // Verify success message
    cy.contains(/success|added|created/i, { timeout: 5000 }).should('be.visible')

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

    // Click edit button
    cy.contains(existingProject.title).parent().parent().within(() => {
      cy.contains('button', /edit/i).click()
    })

    // Update the fields
    cy.get('input[name="title"], input[placeholder*="title" i]').clear().type(updatedProject.title)
    cy.get('textarea[name="description"], textarea[placeholder*="description" i]').clear().type(updatedProject.description)
    cy.get('input[name="liveDemo"], input[placeholder*="demo" i], input[placeholder*="url" i]').first().clear().type(updatedProject.liveDemo)

    // Save changes
    cy.contains('button', /save|update/i).click()
    cy.wait('@updateProject')

    // Verify success message
    cy.contains(/success|updated|saved/i, { timeout: 5000 }).should('be.visible')

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

    // Click delete button
    cy.contains(projectToDelete.title).parent().parent().within(() => {
      cy.contains('button', /delete/i).click()
    })

    // Confirm deletion in dialog
    cy.contains(/confirm|delete|yes/i).click()
    cy.wait('@deleteProject')

    // Verify success message
    cy.contains(/success|deleted|removed/i, { timeout: 5000 }).should('be.visible')

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

    // Click delete button
    cy.contains(project.title).parent().parent().within(() => {
      cy.contains('button', /delete/i).click()
    })

    // Cancel deletion
    cy.contains(/cancel|no/i).click()

    // Verify project still exists
    cy.contains(project.title).should('be.visible')
  })
})
