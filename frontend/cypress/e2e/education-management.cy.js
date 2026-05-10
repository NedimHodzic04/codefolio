/**
 * E2E Test: Education Management
 * Tests: add education → edit → delete
 * Requirements: 10.1, 10.2, 10.3, 10.4
 */

describe('Education Management', () => {
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

    // Mock initial education list (empty)
    cy.intercept('GET', '**/api/education', {
      statusCode: 200,
      body: []
    }).as('getEducation')

    cy.setCookie('connect.sid', 'mock-session-id')
    cy.visit('/dashboard')
    cy.wait('@getUser')
  })

  it('should add a new education entry', () => {
    const newEducation = {
      _id: 'edu-1',
      institution: 'Test University',
      degree: 'Bachelor of Science',
      fieldOfStudy: 'Computer Science',
      startDate: '2018-09-01',
      endDate: '2022-05-31',
      description: 'Studied computer science fundamentals'
    }

    // Mock the POST request
    cy.intercept('POST', '**/api/education', {
      statusCode: 201,
      body: newEducation
    }).as('createEducation')

    // Mock GET to return the new education after creation
    cy.intercept('GET', '**/api/education', {
      statusCode: 200,
      body: [newEducation]
    }).as('getEducationAfterCreate')

    // Navigate to Education section
    cy.contains('Education').click()
    cy.wait(500) // Wait for section to load

    // Click Add Education button
    cy.contains('button', 'Add Education').click()
    cy.wait(500) // Wait for dialog to open

    // Fill out the form using correct IDs
    cy.get('#add-institution').type(newEducation.institution)
    cy.get('#add-degree').type(newEducation.degree)
    cy.get('#add-fieldOfStudy').type(newEducation.fieldOfStudy)
    cy.get('#add-startDate').type('2018-09-01')
    cy.get('#add-endDate').type('2022-05-31')
    cy.get('#add-description').type(newEducation.description)

    // Submit the form - find the button inside the dialog
    cy.get('[role="dialog"]').within(() => {
      cy.contains('button', 'Add Education').click()
    })
    cy.wait('@createEducation')

    // Verify success message
    cy.contains(/success|added|created/i, { timeout: 5000 }).should('be.visible')

    // Wait for the list to refresh
    cy.wait(1000)

    // Verify education appears in the list
    cy.contains(newEducation.institution).should('be.visible')
    cy.contains(newEducation.degree).should('be.visible')
    cy.contains(newEducation.fieldOfStudy).should('be.visible')
  })

  it('should edit an existing education entry', () => {
    const existingEducation = {
      _id: 'edu-1',
      institution: 'Original University',
      degree: 'Bachelor of Arts',
      fieldOfStudy: 'History',
      startDate: '2018-09-01',
      endDate: '2022-05-31'
    }

    const updatedEducation = {
      ...existingEducation,
      institution: 'Updated University',
      degree: 'Bachelor of Science',
      fieldOfStudy: 'Computer Science'
    }

    // Mock education list with existing entry
    cy.intercept('GET', '**/api/education', {
      statusCode: 200,
      body: [existingEducation]
    }).as('getEducationWithData')

    cy.visit('/dashboard')
    cy.wait('@getUser')
    cy.contains('Education').click()
    cy.wait('@getEducationWithData')

    // Mock the PATCH request
    cy.intercept('PATCH', `**/api/education/${existingEducation._id}`, {
      statusCode: 200,
      body: updatedEducation
    }).as('updateEducation')

    // Mock GET to return updated data after the edit
    cy.intercept('GET', '**/api/education', {
      statusCode: 200,
      body: [updatedEducation]
    }).as('getEducationAfterUpdate')

    // Click edit button - find it by text near the institution name
    cy.contains(existingEducation.institution).should('be.visible')
    cy.get('button').contains('Edit').first().click()

    cy.wait(500) // Wait for dialog to open

    // Update the fields using correct IDs for edit dialog
    cy.get('#edit-institution').clear().type(updatedEducation.institution)
    cy.get('#edit-degree').clear().type(updatedEducation.degree)
    cy.get('#edit-fieldOfStudy').clear().type(updatedEducation.fieldOfStudy)

    // Save changes
    cy.contains('button', 'Save Changes').click()
    cy.wait('@updateEducation')

    // Verify success message
    cy.contains(/success|updated|saved/i, { timeout: 5000 }).should('be.visible')

    // Wait for refetch
    cy.wait(1000)

    // Verify updated content
    cy.contains(updatedEducation.institution).should('be.visible')
    cy.contains(updatedEducation.degree).should('be.visible')
    cy.contains(updatedEducation.fieldOfStudy).should('be.visible')
  })

  it('should delete an education entry with confirmation', () => {
    const educationToDelete = {
      _id: 'edu-1',
      institution: 'University to Delete',
      degree: 'Bachelor of Science',
      fieldOfStudy: 'Computer Science',
      startDate: '2018-09-01',
      endDate: '2022-05-31'
    }

    // Mock education list
    cy.intercept('GET', '**/api/education', {
      statusCode: 200,
      body: [educationToDelete]
    }).as('getEducationWithData')

    cy.visit('/dashboard')
    cy.wait('@getUser')
    cy.contains('Education').click()
    cy.wait('@getEducationWithData')

    // Mock the DELETE request
    cy.intercept('DELETE', `**/api/education/${educationToDelete._id}`, {
      statusCode: 200,
      body: { message: 'Education deleted' }
    }).as('deleteEducation')

    // Mock GET to return empty array after deletion
    cy.intercept('GET', '**/api/education', {
      statusCode: 200,
      body: []
    }).as('getEducationAfterDelete')

    // Click delete button - find it by text
    cy.contains(educationToDelete.institution).should('be.visible')
    cy.get('button').contains('Delete').first().click()

    cy.wait(500) // Wait for dialog to open

    // Confirm deletion in dialog - the delete button in the confirmation dialog
    cy.get('[role="dialog"]').within(() => {
      cy.contains('button', 'Delete').click()
    })
    cy.wait('@deleteEducation')

    // Verify success message
    cy.contains(/success|deleted|removed/i, { timeout: 5000 }).should('be.visible')

    // Wait for refetch
    cy.wait(1000)

    // Verify education is removed from list
    cy.contains(educationToDelete.institution).should('not.exist')
  })

  it('should validate date order (start before end)', () => {
    // Navigate to Education section
    cy.contains('Education').click()
    cy.wait(500) // Wait for section to load

    // Click Add Education button
    cy.contains('button', 'Add Education').click()
    cy.wait(500) // Wait for dialog to open

    // Fill out the form with invalid dates (end before start)
    cy.get('#add-institution').type('Test University')
    cy.get('#add-degree').type('Bachelor of Science')
    cy.get('#add-fieldOfStudy').type('Computer Science')
    cy.get('#add-startDate').type('2022-05-31')
    cy.get('#add-endDate').type('2018-09-01')

    // Try to submit the form - find the button inside the dialog
    cy.get('[role="dialog"]').within(() => {
      cy.contains('button', 'Add Education').click()
    })

    // Verify error message appears
    cy.contains(/date|invalid|before|after/i, { timeout: 5000 }).should('be.visible')
  })

  it('should cancel education deletion', () => {
    const education = {
      _id: 'edu-1',
      institution: 'University to Keep',
      degree: 'Bachelor of Science',
      fieldOfStudy: 'Computer Science',
      startDate: '2018-09-01',
      endDate: '2022-05-31'
    }

    // Mock education list
    cy.intercept('GET', '**/api/education', {
      statusCode: 200,
      body: [education]
    }).as('getEducationWithData')

    cy.visit('/dashboard')
    cy.wait('@getUser')
    cy.contains('Education').click()
    cy.wait('@getEducationWithData')

    // Click delete button - find it by text
    cy.contains(education.institution).should('be.visible')
    cy.get('button').contains('Delete').first().click()

    cy.wait(500) // Wait for dialog to open

    // Cancel deletion
    cy.get('[role="dialog"]').within(() => {
      cy.contains('button', 'Cancel').click()
    })

    // Verify education still exists
    cy.contains(education.institution).should('be.visible')
  })
})
