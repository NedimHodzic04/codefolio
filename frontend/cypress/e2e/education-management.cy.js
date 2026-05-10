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

    // Navigate to Education section
    cy.contains('Education').click()

    // Click Add Education button
    cy.contains('button', /add.*education/i).click()

    // Fill out the form
    cy.get('input[name="institution"], input[placeholder*="institution" i]').type(newEducation.institution)
    cy.get('input[name="degree"], input[placeholder*="degree" i]').type(newEducation.degree)
    cy.get('input[name="fieldOfStudy"], input[placeholder*="field" i]').type(newEducation.fieldOfStudy)
    cy.get('input[name="startDate"], input[type="date"]').first().type('2018-09-01')
    cy.get('input[name="endDate"], input[type="date"]').last().type('2022-05-31')

    // Submit the form
    cy.contains('button', /save|create|add/i).click()
    cy.wait('@createEducation')

    // Verify success message
    cy.contains(/success|added|created/i, { timeout: 5000 }).should('be.visible')

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

    // Click edit button
    cy.contains(existingEducation.institution).parent().parent().within(() => {
      cy.contains('button', /edit/i).click()
    })

    // Update the fields
    cy.get('input[name="institution"], input[placeholder*="institution" i]').clear().type(updatedEducation.institution)
    cy.get('input[name="degree"], input[placeholder*="degree" i]').clear().type(updatedEducation.degree)
    cy.get('input[name="fieldOfStudy"], input[placeholder*="field" i]').clear().type(updatedEducation.fieldOfStudy)

    // Save changes
    cy.contains('button', /save|update/i).click()
    cy.wait('@updateEducation')

    // Verify success message
    cy.contains(/success|updated|saved/i, { timeout: 5000 }).should('be.visible')

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

    // Click delete button
    cy.contains(educationToDelete.institution).parent().parent().within(() => {
      cy.contains('button', /delete/i).click()
    })

    // Confirm deletion in dialog
    cy.contains(/confirm|delete|yes/i).click()
    cy.wait('@deleteEducation')

    // Verify success message
    cy.contains(/success|deleted|removed/i, { timeout: 5000 }).should('be.visible')

    // Verify education is removed from list
    cy.contains(educationToDelete.institution).should('not.exist')
  })

  it('should validate date order (start before end)', () => {
    // Navigate to Education section
    cy.contains('Education').click()

    // Click Add Education button
    cy.contains('button', /add.*education/i).click()

    // Fill out the form with invalid dates (end before start)
    cy.get('input[name="institution"], input[placeholder*="institution" i]').type('Test University')
    cy.get('input[name="degree"], input[placeholder*="degree" i]').type('Bachelor of Science')
    cy.get('input[name="fieldOfStudy"], input[placeholder*="field" i]').type('Computer Science')
    cy.get('input[name="startDate"], input[type="date"]').first().type('2022-05-31')
    cy.get('input[name="endDate"], input[type="date"]').last().type('2018-09-01')

    // Try to submit the form
    cy.contains('button', /save|create|add/i).click()

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

    // Click delete button
    cy.contains(education.institution).parent().parent().within(() => {
      cy.contains('button', /delete/i).click()
    })

    // Cancel deletion
    cy.contains(/cancel|no/i).click()

    // Verify education still exists
    cy.contains(education.institution).should('be.visible')
  })
})
