// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Custom command to login via GitHub OAuth (mocked)
Cypress.Commands.add('login', (userData = null) => {
  // Load test user data from fixture if not provided
  if (!userData) {
    cy.fixture('test-user').then((user) => {
      setupMockAuth(user)
    })
  } else {
    setupMockAuth(userData)
  }
})

function setupMockAuth(user) {
  // Mock the /api/me endpoint
  cy.intercept('GET', '**/api/me', {
    statusCode: 200,
    body: user
  }).as('getUser')
  
  // Set a mock session cookie
  cy.setCookie('connect.sid', 'mock-session-id')
}

// Custom command to logout
Cypress.Commands.add('logout', () => {
  cy.clearCookies()
  cy.clearLocalStorage()
})

// Custom command to wait for API calls
Cypress.Commands.add('waitForApi', (alias) => {
  cy.wait(`@${alias}`)
})

// Custom command to mock projects API
Cypress.Commands.add('mockProjects', (projects = null) => {
  if (!projects) {
    cy.fixture('test-projects').then((data) => {
      cy.intercept('GET', '**/api/projects', {
        statusCode: 200,
        body: data
      }).as('getProjects')
    })
  } else {
    cy.intercept('GET', '**/api/projects', {
      statusCode: 200,
      body: projects
    }).as('getProjects')
  }
})

// Custom command to mock education API
Cypress.Commands.add('mockEducation', (education = null) => {
  if (!education) {
    cy.fixture('test-education').then((data) => {
      cy.intercept('GET', '**/api/education', {
        statusCode: 200,
        body: data
      }).as('getEducation')
    })
  } else {
    cy.intercept('GET', '**/api/education', {
      statusCode: 200,
      body: education
    }).as('getEducation')
  }
})

