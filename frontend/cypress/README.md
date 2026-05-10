# Cypress E2E Tests

This directory contains end-to-end tests for the CodeFolio dashboard using Cypress.

## Test Coverage

The E2E test suite covers the following user flows:

1. **Complete User Flow** (`user-flow.cy.js`)
   - Login → Dashboard → Edit Profile → View Portfolio
   - Authentication and session management
   - Profile updates and skill management

2. **Project Management** (`project-management.cy.js`)
   - Add custom project
   - Edit existing project
   - Delete project with confirmation
   - Cancel deletion

3. **Education Management** (`education-management.cy.js`)
   - Add education entry
   - Edit education entry
   - Delete education entry with confirmation
   - Date validation (start before end)

4. **GitHub Re-Sync** (`github-resync.cy.js`)
   - Successful repository synchronization
   - Loading states during sync
   - Error handling
   - Preservation of custom projects

5. **Appearance Changes** (`appearance-changes.cy.js`)
   - Layout template selection
   - Theme selection
   - Changes reflecting on portfolio
   - Persistence across sessions

## Running Tests

### Prerequisites

1. Install dependencies:
   ```bash
   npm install
   ```

2. Ensure both backend and frontend servers are running:
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm start

   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

### Interactive Mode (Development)

Open Cypress Test Runner for interactive testing:

```bash
npm run cypress:open
```

This will open the Cypress GUI where you can:
- Select and run individual test files
- Watch tests run in real-time
- Debug failing tests
- See detailed error messages and screenshots

### Headless Mode (CI/CD)

Run all tests in headless mode:

```bash
npm run test:e2e
```

Or with specific browser:

```bash
npm run test:e2e:ci  # Chrome headless
```

## Test Structure

Each test file follows this structure:

```javascript
describe('Feature Name', () => {
  beforeEach(() => {
    // Setup: Mock authentication and API responses
  })

  it('should perform specific action', () => {
    // Test implementation
  })
})
```

## Mocking Strategy

Since GitHub OAuth cannot be tested directly in E2E tests, we use the following approach:

1. **Authentication**: Mock the `/api/me` endpoint to return a test user
2. **Session**: Set a mock session cookie using `cy.setCookie()`
3. **API Calls**: Intercept and mock all API endpoints with `cy.intercept()`

This allows us to test the full user interface without requiring actual backend integration.

## Custom Commands

Custom Cypress commands are defined in `cypress/support/commands.js`:

- `cy.login()` - Mock user authentication
- `cy.logout()` - Clear session and cookies
- `cy.waitForApi(alias)` - Wait for specific API call

## Configuration

Cypress configuration is in `cypress.config.js`:

- **Base URL**: `http://localhost:5173` (Vite dev server)
- **API URL**: `http://localhost:5000/api` (Backend API)
- **Viewport**: 1280x720
- **Video**: Disabled by default
- **Screenshots**: Enabled on failure

## CI/CD Integration

Tests run automatically in GitHub Actions on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`

The CI pipeline:
1. Starts MongoDB service
2. Installs dependencies
3. Starts backend server
4. Starts frontend dev server
5. Runs Cypress tests in headless mode
6. Uploads screenshots and videos as artifacts on failure

See `.github/workflows/test.yml` for full configuration.

## Debugging Failed Tests

When a test fails:

1. **Screenshots**: Check `cypress/screenshots/` for failure screenshots
2. **Videos**: Check `cypress/videos/` for test recordings (if enabled)
3. **Console**: Review browser console logs in Cypress Test Runner
4. **Network**: Inspect network requests in Cypress Test Runner

## Best Practices

1. **Isolation**: Each test should be independent and not rely on other tests
2. **Cleanup**: Use `beforeEach` to reset state before each test
3. **Waiting**: Use `cy.wait()` for API calls, not arbitrary timeouts
4. **Selectors**: Prefer semantic selectors (text content) over brittle CSS selectors
5. **Assertions**: Make assertions explicit and meaningful

## Requirements Validation

Each test file validates specific requirements from the design document:

- **user-flow.cy.js**: Requirements 1.1, 1.2, 1.3, 2.2, 2.4, 3.1, 9.1-9.4
- **project-management.cy.js**: Requirements 4.1, 4.2, 5.1, 5.2, 7.1, 7.2, 8.1, 8.2
- **education-management.cy.js**: Requirements 10.1, 10.2, 10.3, 10.4
- **github-resync.cy.js**: Requirements 6.1, 6.2, 6.3, 6.4
- **appearance-changes.cy.js**: Requirements 11.1, 11.2, 11.3, 12.1, 12.2, 12.3

## Troubleshooting

### Tests fail with "Cannot find element"

- Ensure the frontend is running on `http://localhost:5173`
- Check that the component structure matches the test selectors
- Verify API mocks are returning expected data

### Tests timeout

- Increase timeout in `cypress.config.js`
- Check that servers are running and accessible
- Verify network intercepts are configured correctly

### Authentication issues

- Ensure `cy.intercept('GET', '**/api/me')` is called in `beforeEach`
- Verify session cookie is set with `cy.setCookie()`
- Check that auth context is properly initialized

## Future Improvements

- Add visual regression testing
- Implement accessibility testing with cypress-axe
- Add performance monitoring
- Expand test coverage for edge cases
- Add tests for mobile responsive behavior
