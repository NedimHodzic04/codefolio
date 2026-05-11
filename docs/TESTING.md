# System Testing Documentation

Testing for Codefolio is organized into four levels: property-based testing, unit testing, integration testing, and end-to-end testing. Together, these levels provide coverage across the correctness properties of the system, individual logic components, interactions between system layers, and complete user-facing workflows.

## 5.1 Property-Based Testing

Property-based testing (PBT) forms the foundation of Codefolio's correctness validation strategy. Unlike traditional example-based tests that verify specific inputs and outputs, property-based tests verify universal properties that should hold true across all valid inputs. The system uses the `fast-check` library to generate hundreds of random test cases for each property, providing strong evidence of correctness.

### 5.1.1 Core System Properties

**Authentication and Authorization Properties**

Property: Session-based authentication maintains security invariants
- For any authenticated session, the session cookie must contain a valid user ID that exists in the database
- For any expired session, all protected endpoints must return 401 Unauthorized
- For any user attempting to access another user's resources, the system must return 403 Forbidden

Property: OAuth token exchange is secure
- For any valid GitHub authorization code, the token exchange must succeed exactly once
- For any reused authorization code, the token exchange must fail
- For any tampered authorization code, the token exchange must fail and log the attempt

**Data Integrity Properties**

Property: User profile data consistency
- For any user, the GitHub-sourced fields (username, displayName, avatarUrl, email) must match the latest GitHub API response after re-authentication
- For any user-editable field (bio, location, skills, socials), updates must be atomic and never result in partial writes
- For any concurrent profile updates, the last write must win without data corruption

Property: Project-user relationship integrity
- For any project in the system, it must have exactly one owner (user reference)
- For any user deletion, all associated projects must be deleted or reassigned
- For any project query, only the owner or public viewers can access the data

Property: Education chronological consistency
- For any education entry with both start and end dates, startDate ≤ endDate must hold
- For any user's education list, entries should be orderable by date without ambiguity
- For any education entry marked as "current", endDate must be null

### 5.1.2 GitHub Integration Properties

**Repository Import Properties**

Property: Initial repository import completeness
- For any new user with N public repositories on GitHub, the initial import must create exactly N project documents
- For any repository marked as a fork, it must be excluded from the import
- For any repository with null fields (description, language, homepage), the import must handle gracefully with default values

Property: Repository re-sync idempotence
- For any user triggering re-sync multiple times in succession, the final state must be identical to a single re-sync
- For any GitHub repository that no longer exists, re-sync must not delete the corresponding project (preserve user's history)
- For any custom project (no githubRepoId), re-sync must never modify or delete it

Property: Repository data freshness
- For any GitHub repository updated after the last sync, re-sync must reflect the latest description, language, and star count
- For any repository renamed on GitHub, re-sync must update the title while preserving the githubRepoId link
- For any repository made private on GitHub, re-sync must mark it as unavailable but preserve the project record

**API Rate Limiting Properties**

Property: GitHub API rate limit handling
- For any user triggering re-sync when rate limit is exhausted, the system must return a clear error message with retry-after time
- For any batch operation (initial import), the system must respect rate limits and queue remaining requests
- For any rate limit error, the system must log the occurrence for monitoring

### 5.1.3 Portfolio Rendering Properties

**Template and Theme Properties**

Property: Template switching preserves content
- For any user switching between layout templates, all content (projects, education, skills) must remain visible and accessible
- For any template, all required sections (profile, projects) must be rendered
- For any template, optional sections (education, skills) must be conditionally rendered based on data availability

Property: Theme application consistency
- For any theme selection, all CSS variables must be updated consistently across all portfolio pages
- For any theme, text contrast ratios must meet WCAG AA standards for accessibility
- For any theme switch, the change must be reflected immediately without requiring page reload

Property: Public portfolio accessibility
- For any username, the portfolio must be accessible at `code-folio.app/username` without authentication
- For any non-existent username, the system must return a 404 page with helpful navigation
- For any portfolio view, the page must load within 2 seconds under normal network conditions

### 5.1.4 Dashboard Management Properties

**Skills Management Properties**

Property: Skill additions are idempotent
- For any skill string, adding it multiple times must result in the skill appearing exactly once in the user's skill list
- For any skill with leading/trailing whitespace, the system must normalize it before storage
- For any skill exceeding maximum length, the system must reject it with a validation error

Property: Skill removal is complete
- For any skill in the user's skill list, removing it must result in the skill no longer appearing in the list or database
- For any skill removal, the operation must complete in under 500ms
- For any concurrent skill additions and removals, the final state must reflect all operations without data loss

**Project Management Properties**

Property: Custom project creation
- For any custom project with required fields (title), creation must succeed and assign a unique ID
- For any custom project without githubRepoId, it must be distinguishable from GitHub-imported projects
- For any custom project, all fields (description, techStack, liveDemo, imageUrl) must be editable

Property: Project editing preserves identity
- For any project update, the project ID and owner must remain unchanged
- For any GitHub-imported project, editing must not remove the githubRepoId link
- For any project with a liveDemo URL, the system must validate URL format before saving

Property: Project deletion is irreversible
- For any project deletion, the project must be removed from both the Projects collection and the user's project array
- For any deleted project, subsequent queries must return 404
- For any project deletion, the operation must require explicit confirmation to prevent accidental loss

**Education Management Properties**

Property: Education CRUD maintains chronological integrity
- For any education entry, the start date must be before or equal to the end date when an end date is provided
- For any education entry marked as "current", the end date must be null
- For any user's education list, entries must be sortable by start date in descending order

Property: Education data completeness
- For any education entry, required fields (institution, degree, fieldOfStudy, startDate) must be present
- For any education entry, optional fields (endDate, description) may be null
- For any education entry, the description field must support markdown formatting

### 5.1.5 Social Links and External Integration Properties

Property: Social link validation
- For any social link (LinkedIn, Twitter, website), the system must validate URL format before saving
- For any invalid URL, the system must return a 400 error with specific field-level feedback
- For any social link, the system must support both HTTP and HTTPS protocols

Property: Social link display
- For any portfolio with social links, the links must be rendered with appropriate icons
- For any social link, clicking must open in a new tab with `rel="noopener noreferrer"` for security
- For any missing social link, the corresponding icon must not be displayed

## 5.2 Unit Testing

Unit testing targets the smallest testable units of the application in isolation, independent of the database, GitHub API, or any other external dependency.

### 5.2.1 Backend Unit Tests

**GitHub Data Mapping**

The `fetchAndSaveRepos` function in `backend/src/utils/github.js` is responsible for mapping GitHub repository objects to Project documents. Unit tests verify that:
- Repository name maps to `title`
- Repository description maps to `description` (with empty string fallback for null)
- Repository HTML URL maps to `githubLink`
- Repository language maps to `language` (with empty string fallback for null)
- Repository ID maps to `githubRepoId` for upsert operations
- Fork repositories are correctly filtered out
- Private repositories are excluded from import
- Archived repositories are marked appropriately

Edge cases tested include:
- Repositories with null description fields
- Repositories with no detected primary language
- Repositories with no homepage value
- Repositories marked as forks
- Repositories with special characters in names
- Repositories with very long descriptions (truncation handling)

**Input Validation**

Routes that accept PATCH requests for updating user profile fields, skill arrays, or project descriptions are tested by passing malformed or missing request bodies and asserting that the appropriate HTTP error responses are returned before any database operation is attempted.

**Profile Validation Tests:**
- Empty bio strings are accepted (users can clear their bio)
- Bio strings exceeding 500 characters are rejected
- Location strings with special characters are sanitized
- Social media URLs are validated for correct format (must start with http:// or https://)
- Invalid URLs return 400 Bad Request with descriptive error messages
- XSS attempts in bio/location fields are sanitized

**Project Validation Tests:**
- Required fields (title, user reference) are enforced
- Title must be between 1 and 100 characters
- Optional fields (description, liveDemo, imageUrl) accept null values
- GitHub repository IDs must be unique across the system
- Tech stack arrays accept string values only (no objects or nested arrays)
- Live demo URLs must be valid HTTP/HTTPS URLs
- Image URLs must be valid and point to image file types

**Education Validation Tests:**
- Required fields (institution, degree, fieldOfStudy, startDate) are enforced
- Institution and degree names must be non-empty strings
- Start date must be a valid ISO 8601 date
- End date, if provided, must be after start date
- Description field supports markdown but sanitizes HTML
- Field of study must be from a predefined list or "Other"

**Appearance Validation Tests:**
- Layout template must be one of the predefined options
- Theme must be one of the predefined options
- Invalid template/theme selections return 400 with available options
- Template and theme changes are atomic (both succeed or both fail)

### 5.2.2 Frontend Unit Tests

**Component Logic Tests**

**ProfileSection Component:**
- Bio editing toggles between view and edit modes correctly
- Location editing toggles between view and edit modes correctly
- Skill addition validates non-empty input
- Skill removal triggers confirmation for last skill
- Social links validate URL format before submission
- Form submission disables buttons to prevent double-submission

**ProjectsSection Component:**
- Project list renders all projects (GitHub and custom) correctly
- "Add Custom Project" opens modal with empty form
- Edit project pre-fills form with existing data
- Delete project shows confirmation dialog
- Re-sync button shows loading state during operation
- Error messages display when API calls fail

**EducationSection Component:**
- Education list sorts by start date (most recent first)
- "Add Education" opens modal with empty form
- Edit education pre-fills form with existing data
- Delete education shows confirmation dialog
- Current education (no end date) displays "Present"
- Date picker enforces start date before end date

**AppearanceSection Component:**
- Template selector displays all available templates with previews
- Theme selector displays all available themes with color swatches
- "View Portfolio" link opens portfolio in new tab
- Changes are saved only when "Save" button is clicked
- Unsaved changes show warning when navigating away

**Utility Function Tests**

**Date Formatting:**
- `formatDate` converts ISO dates to human-readable format
- `formatDateRange` handles current education (null end date)
- `isValidDateRange` validates start date before end date

**URL Validation:**
- `isValidUrl` accepts HTTP and HTTPS URLs
- `isValidUrl` rejects malformed URLs
- `isValidUrl` rejects javascript: and data: URLs (XSS prevention)

**Optimistic UI Helpers:**
- `useOptimistic` hook updates UI immediately
- `useOptimistic` rolls back on API error
- `useOptimistic` shows loading state during operation

## 5.3 Integration Testing

Integration testing targets the interactions between the application layer and its two primary external dependencies: MongoDB and the GitHub API.

### 5.3.1 GitHub OAuth Flow

The GitHub OAuth callback route (`/api/auth/github/callback`) is the most critical integration point in the system. It is responsible for:
1. Exchanging an authorization code for an access token
2. Retrieving the user's GitHub profile
3. Determining whether an account already exists in the database
4. Either creating a new User document or loading an existing one
5. Populating the session with user data
6. Importing repositories for first-time users

This flow is tested using mocked GitHub API responses to simulate both the first-time user and returning user paths, with assertions verifying that:
- The correct database operations are performed in each case
- The session is correctly populated on completion
- The user is redirected to the dashboard
- The session cookie is set with correct security attributes (httpOnly, secure, sameSite)

**First-time User Path:**
- User document is created with GitHub profile data
- `fetchAndSaveRepos` is called to import repositories
- User is redirected to dashboard
- Session contains user ID and profile data
- Welcome email is sent (if email is available)

**Returning User Path:**
- Existing user document is loaded from database
- GitHub profile data is updated (avatar, email may have changed)
- No repository import occurs (only on first sign-up)
- User is redirected to dashboard
- Session is updated with latest profile data

**Error Handling Paths:**
- Invalid authorization code redirects to login with error message
- GitHub API timeout shows retry option
- Database connection failure shows maintenance page
- Session save failure redirects to login

### 5.3.2 Database Transaction Testing

Integration tests verify that multi-step database operations maintain consistency:

**Education Management:**
- Creating an education entry adds it to both the Education collection and the user's education array
- Deleting an education entry removes it from both locations
- Failed operations roll back completely (no orphaned references)
- Concurrent education additions do not result in duplicate entries

**Project Management:**
- Creating a custom project links it to the user
- Deleting a project removes it from the user's project list
- GitHub re-sync operations use upsert correctly to avoid duplicates
- Updating a project preserves the githubRepoId if present

**User Deletion:**
- Deleting a user cascades to all associated projects
- Deleting a user cascades to all associated education entries
- Deleting a user removes all sessions
- Deleted usernames become available for re-registration

### 5.3.3 Session Persistence

Integration tests verify that session data persists correctly across requests:
- Session cookies are set with correct attributes (httpOnly, secure, sameSite)
- Session data is stored in MongoDB via MongoStore
- Sessions expire after the configured timeout (24 hours)
- Logout correctly destroys the session
- Session regeneration occurs after privilege escalation
- Concurrent sessions from the same user are supported

### 5.3.4 GitHub API Integration

Integration tests verify correct interaction with the GitHub API:

**Repository Fetching:**
- API requests include proper authentication headers
- Pagination is handled for users with >100 repositories
- Rate limit headers are checked before making requests
- Conditional requests use ETags to minimize API calls
- Network errors are retried with exponential backoff

**Profile Data Fetching:**
- User profile data is fetched during OAuth callback
- Profile data includes email (requires user:email scope)
- Profile data is cached and refreshed periodically
- Deleted GitHub accounts are handled gracefully

### 5.3.5 Email Notification Integration

Integration tests verify email sending functionality:

**Welcome Email:**
- Sent to new users after first sign-up
- Contains link to dashboard
- Contains link to portfolio
- Respects user's email preferences

**Re-sync Completion Email:**
- Sent after successful repository re-sync
- Lists number of repositories updated
- Includes link to projects section
- Only sent if user has opted in to notifications

## 5.4 End-to-End Testing

End-to-end (E2E) testing validates complete user workflows from the browser through the full application stack. Codefolio uses Cypress for E2E testing, with tests organized by user journey.

### 5.4.1 Complete User Flow

**Test:** `frontend/cypress/e2e/user-flow.cy.js`

This test simulates a new user's complete journey through the application:
1. User visits the landing page
2. User clicks "Join for Free" and is redirected to GitHub OAuth
3. User authorizes the application (mocked in test environment)
4. User is redirected to dashboard
5. User sees welcome message and onboarding tips
6. User edits their bio and location
7. User adds skills
8. User views their public portfolio
9. User verifies that changes are visible on the portfolio page
10. User logs out and verifies session is destroyed

**Validates:** Requirements 1.1, 1.2, 2.1, 2.2, 2.3, 2.4, 3.1, 3.2

### 5.4.2 Project Management Flow

**Test:** `frontend/cypress/e2e/project-management.cy.js`

This test validates the complete project management workflow:
1. User navigates to Projects section in dashboard
2. User views imported GitHub projects
3. User clicks "Add Custom Project"
4. User fills out project form (title, description, tech stack, live demo URL, image URL)
5. User saves the project
6. User verifies project appears in list
7. User edits an existing project
8. User verifies changes are saved
9. User deletes a project with confirmation
10. User verifies project is removed from list
11. User triggers GitHub re-sync
12. User verifies that custom projects are preserved after re-sync
13. User verifies that GitHub projects are updated with latest data

**Validates:** Requirements 4.1, 4.2, 5.1, 5.2, 5.3, 6.1, 6.2, 6.3, 7.1, 7.2, 8.1, 8.2, 8.3

### 5.4.3 Education Management Flow

**Test:** `frontend/cypress/e2e/education-management.cy.js`

This test validates education entry management:
1. User navigates to Education section
2. User clicks "Add Education"
3. User fills out education form (institution, degree, field of study, start date, end date, description)
4. User saves the entry
5. User verifies entry appears in list
6. User edits an existing entry
7. User changes end date to null (marking as current)
8. User verifies "Present" is displayed
9. User deletes an entry with confirmation
10. User verifies entry is removed from list
11. User verifies chronological ordering (most recent first)

**Validates:** Requirements 10.1, 10.2, 10.3, 10.4

### 5.4.4 GitHub Re-Sync Flow

**Test:** `frontend/cypress/e2e/github-resync.cy.js`

This test specifically validates the GitHub repository re-sync feature:
1. User has existing projects (both GitHub and custom)
2. User clicks "Re-Sync GitHub" button
3. Loading state is displayed
4. Re-sync completes successfully
5. GitHub projects are updated with latest data
6. Custom projects remain unchanged
7. Success message is displayed with count of updated repositories
8. User verifies that new repositories appear in list
9. User verifies that deleted repositories are marked as unavailable

**Validates:** Requirements 6.1, 6.2, 6.3, 6.4

### 5.4.5 Appearance Changes Flow

**Test:** `frontend/cypress/e2e/appearance-changes.cy.js`

This test validates appearance customization:
1. User navigates to Appearance section
2. User views available layout templates with previews
3. User selects a different layout template
4. User views available themes with color swatches
5. User selects a different theme
6. User saves changes
7. User clicks "View Portfolio"
8. User verifies that portfolio displays with new layout and theme
9. User returns to dashboard and verifies settings are persisted
10. User switches to another template and verifies content is preserved

**Validates:** Requirements 11.1, 11.2, 11.3, 12.1, 12.2, 12.3

### 5.4.6 Social Links Management Flow

**Test:** `frontend/cypress/e2e/social-links.cy.js`

This test validates social media link management:
1. User navigates to Profile section
2. User enters LinkedIn URL
3. User enters Twitter URL
4. User enters personal website URL
5. User saves social links
6. User views public portfolio
7. User verifies social link icons are displayed
8. User clicks each social link and verifies it opens in new tab
9. User returns to dashboard and removes a social link
10. User verifies removed link no longer appears on portfolio

**Validates:** Requirements 9.1, 9.2, 9.3, 9.4

### 5.4.7 Responsive Design Flow

**Test:** `frontend/cypress/e2e/responsive-design.cy.js`

This test validates responsive behavior across device sizes:
1. Test runs on desktop viewport (1280x720)
2. User navigates through all dashboard sections
3. User verifies sidebar navigation is visible
4. Test switches to tablet viewport (768x1024)
5. User verifies navigation adapts appropriately
6. Test switches to mobile viewport (375x667)
7. User verifies tab navigation replaces sidebar
8. User verifies all forms are usable on mobile
9. User verifies portfolio page is mobile-friendly

**Validates:** Requirements 1.1, 6.1 (responsive design aspects)

### 5.4.8 Error Handling Flow

**Test:** `frontend/cypress/e2e/error-handling.cy.js`

This test validates error handling and recovery:
1. User attempts to save profile with invalid data
2. User verifies inline validation errors are displayed
3. User corrects errors and successfully saves
4. User triggers API error (simulated network failure)
5. User verifies error toast is displayed
6. User verifies optimistic UI rollback occurs
7. User retries operation and succeeds
8. User navigates to non-existent portfolio URL
9. User verifies 404 page is displayed with helpful navigation

**Validates:** Error handling requirements across all features

## 5.5 Continuous Integration

All tests are executed automatically on every push to the main branch via GitHub Actions. The CI pipeline is defined in `.github/workflows/test.yml` and includes:

**Backend Tests:**
- Property-based tests (fast-check) - 100 iterations per property
- Unit tests for all controllers and utilities
- Integration tests for database and GitHub API
- Runs on Node.js 18.x and 20.x
- Uses MongoDB test instance
- Mocks GitHub API responses

**Frontend Tests:**
- Cypress E2E tests for all user workflows
- Runs against a test database
- Uses mocked GitHub OAuth for authentication
- Captures screenshots and videos on failure
- Tests on Chrome, Firefox, and Edge browsers

**Test Coverage Requirements:**
- Backend: Minimum 80% code coverage
- Frontend: All critical user paths must pass E2E tests
- Property-based tests: Minimum 100 iterations per property
- Integration tests: All external API interactions must be tested

**CI Pipeline Stages:**
1. **Lint and Format Check** - ESLint and Prettier
2. **Backend Unit Tests** - Fast execution, no external dependencies
3. **Backend Integration Tests** - With test database
4. **Backend Property Tests** - 100 iterations per property
5. **Frontend Build** - Verify production build succeeds
6. **Frontend E2E Tests** - Full user workflow validation
7. **Coverage Report** - Upload to Codecov
8. **Deployment** - Only if all tests pass

## 5.6 Test Execution

### Running Tests Locally

**Backend Tests:**
```bash
cd backend
npm test                    # Run all tests
npm run test:watch         # Run tests in watch mode
npm run test:coverage      # Generate coverage report
npm run test:unit          # Run unit tests only
npm run test:integration   # Run integration tests only
npm run test:property      # Run property-based tests only
```

**Frontend E2E Tests:**
```bash
cd frontend
npm run cypress:open       # Open Cypress UI
npm run cypress:run        # Run tests headlessly
npm run cypress:run:chrome # Run on Chrome
npm run cypress:run:firefox # Run on Firefox
npm run cypress:run:mobile # Run with mobile viewport
```

**Full Test Suite:**
```bash
npm run test:all           # Run all backend and frontend tests
```

### Test Configuration

**Property-Based Test Configuration:**
- Each property test runs 100 iterations by default
- Configurable via `fc.assert` parameters
- Seed values are logged for reproducibility
- Verbose mode available for debugging

**Cypress Configuration:**
- Base URL: `http://localhost:5173` (Vite dev server)
- API URL: `http://localhost:5000` (Express server)
- Test isolation: Each test starts with a clean database state
- Viewport: 1280x720 (desktop), 375x667 (mobile)
- Video recording: On failure only
- Screenshot: On failure only
- Retry: Failed tests retry once

**Jest Configuration (Backend):**
- Test environment: Node
- Coverage threshold: 80%
- Test timeout: 10 seconds
- Setup files: Database connection, mocks
- Teardown files: Database cleanup

## 5.7 Test Maintenance

### Adding New Tests

When adding new features, follow this testing hierarchy:

1. **Define correctness properties** in the design document
2. **Implement property-based tests** to verify universal properties
3. **Add unit tests** for isolated logic components
4. **Add integration tests** for database and API interactions
5. **Add E2E tests** for complete user workflows

### Test Naming Conventions

**Property-Based Tests:**
- File: `<feature>.property.test.js`
- Test name: `Property N: <property description>`
- Comment: `**Feature: <feature-name>, Property N: <property-text>**`
- Comment: `**Validates: Requirements X.Y**`

**Unit Tests:**
- File: `<component>.test.js`
- Test name: Descriptive of the specific behavior being tested
- Use `describe` blocks to group related tests
- Use `it` or `test` for individual test cases

**Integration Tests:**
- File: `<feature>.integration.test.js`
- Test name: Descriptive of the integration being tested
- Include setup and teardown for external dependencies

**E2E Tests:**
- File: `<workflow>.cy.js`
- Test name: Descriptive of the user journey
- Use `describe` blocks for related workflows
- Use `it` for individual test scenarios

### Debugging Failed Tests

**Property-Based Test Failures:**
- fast-check logs the failing input that caused the property violation
- Use the seed value to reproduce the exact failure
- Add the failing case as a regression test
- Use `fc.sample` to generate example inputs for debugging

**E2E Test Failures:**
- Cypress captures screenshots and videos of failures
- Check `frontend/cypress/screenshots` and `frontend/cypress/videos`
- Use `cy.debug()` to pause execution and inspect state
- Use `cy.pause()` to manually step through test
- Check browser console logs in Cypress UI

**Integration Test Failures:**
- Check database state after failure
- Verify external API mocks are configured correctly
- Check network logs for API calls
- Verify test isolation (clean database between tests)

## 5.8 Known Limitations

**Property-Based Testing:**
- Properties are probabilistic, not exhaustive
- 100 iterations provide strong evidence but not mathematical proof
- Complex properties may require custom generators
- Performance properties (response time) are not tested via PBT

**E2E Testing:**
- GitHub OAuth is mocked in test environment
- Real GitHub API rate limits are not tested
- Production deployment scenarios are not covered
- Email sending is mocked (no real emails sent)
- Payment processing (if added) would be mocked

**Integration Testing:**
- MongoDB transactions are not tested (single-document operations only)
- Network failures and timeouts are not fully simulated
- Concurrent user scenarios are limited
- Database replication and failover not tested

**Unit Testing:**
- UI component tests do not test visual appearance
- Accessibility testing is limited to automated checks
- Browser compatibility is not tested at unit level

## 5.9 Performance Testing

While not part of the standard test suite, performance testing is conducted periodically:

**Load Testing:**
- Simulate 100 concurrent users accessing portfolios
- Measure response times under load
- Identify bottlenecks in database queries
- Test GitHub API rate limit handling under load

**Stress Testing:**
- Test system behavior with 1000+ concurrent users
- Identify breaking points
- Verify graceful degradation
- Test recovery after overload

**Endurance Testing:**
- Run system under normal load for 24 hours
- Monitor for memory leaks
- Check database connection pool exhaustion
- Verify session cleanup

**Tools:**
- Artillery for load testing
- k6 for stress testing
- Lighthouse for frontend performance
- MongoDB profiler for query optimization

## 5.10 Security Testing

Security testing is integrated throughout the test suite:

**Authentication Security:**
- Session fixation attacks are prevented
- CSRF tokens are validated on state-changing operations
- Session cookies have secure attributes (httpOnly, secure, sameSite)
- Password-less authentication via GitHub OAuth

**Authorization Security:**
- Users cannot access other users' private data
- API endpoints verify ownership before modifications
- SQL injection is not applicable (NoSQL database)
- NoSQL injection attempts are sanitized

**Input Validation Security:**
- XSS attempts in user input are sanitized
- HTML in markdown fields is escaped
- URL validation prevents javascript: and data: URLs
- File upload validation (if added) checks file types and sizes

**Dependency Security:**
- npm audit runs in CI pipeline
- Dependabot alerts for vulnerable dependencies
- Regular updates to patch security issues

## 5.11 Accessibility Testing

Accessibility is tested at multiple levels:

**Automated Testing:**
- axe-core integration in Cypress tests
- WCAG 2.1 AA compliance checks
- Color contrast validation
- Keyboard navigation testing

**Manual Testing:**
- Screen reader testing (NVDA, JAWS)
- Keyboard-only navigation
- High contrast mode testing
- Zoom testing (up to 200%)

**Accessibility Requirements:**
- All interactive elements must be keyboard accessible
- All images must have alt text
- All forms must have proper labels
- Color must not be the only means of conveying information
- Focus indicators must be visible

## 5.12 Future Testing Enhancements

**Planned Improvements:**
- Increase property test iterations to 1000 for critical properties
- Add mutation testing to verify test suite effectiveness
- Implement visual regression testing for UI components
- Add performance testing for GitHub re-sync with large repositories (1000+ repos)
- Add load testing for concurrent user sessions
- Implement contract testing for GitHub API integration
- Add chaos engineering tests (random failures)
- Implement A/B testing framework for feature experiments
- Add monitoring and alerting for production errors
- Implement synthetic monitoring for uptime checks

**Test Coverage Goals:**
- Backend: 90% code coverage
- Frontend: 85% code coverage
- E2E: 100% of critical user paths
- Property tests: 1000 iterations per property
- Integration tests: All external APIs mocked and tested

## 5.13 Test Documentation

All tests are documented with:
- Purpose: What the test validates
- Requirements: Which requirements it covers
- Setup: Any special configuration needed
- Expected behavior: What should happen
- Edge cases: Special scenarios tested

Test documentation is maintained in:
- Inline comments in test files
- README files in test directories
- This system testing document
- Design documents with property definitions

**Property 7: Education CRUD maintains chronological integrity**

This property verifies that education entries maintain valid date relationships throughout their lifecycle. For any education entry, the start date must be before or equal to the end date when an end date is provided. The test generates random education entries with various date combinations and verifies that:
- Entries with `endDate` set always have `startDate <= endDate`
- Entries with `null` endDate (indicating current enrollment) are accepted
- Database operations preserve these constraints

**Test Location:** `backend/src/tests/education.property.test.js`

**Validates:** Requirements 10.2, 10.3

### 5.1.2 Profile Management Properties

**Property 1: Profile updates persist correctly**

For any authenticated user and valid profile field update (bio, location, or social links), submitting the update must result in the database containing the new value and the API returning the updated value. The test generates random profile data including:
- Bio strings of varying lengths (empty, short, long)
- Location strings with special characters
- Social media URLs (LinkedIn, Twitter, personal websites)

The property verifies that each update operation is atomic and that concurrent updates do not result in data loss.

**Test Location:** `backend/src/tests/profile.property.test.js`

**Validates:** Requirements 2.2, 2.4, 9.1, 9.2, 9.3, 9.4

### 5.1.3 Skills Management Properties

**Property 2: Skill additions are idempotent**

For any skill string, adding it multiple times must result in the skill appearing exactly once in the user's skill list. This property ensures that the MongoDB `$addToSet` operator is used correctly and that the UI does not allow duplicate skills to be created through race conditions or repeated submissions.

**Property 3: Skill removal is complete**

For any skill in the user's skill list, removing it must result in the skill no longer appearing in the list or database. The test verifies that the MongoDB `$pull` operator correctly removes all instances of the skill and that the operation is reflected in subsequent API responses.

**Test Locations:** 
- `backend/src/tests/skill-idempotence.property.test.js`
- `backend/src/tests/skill-removal.property.test.js`

**Validates:** Requirements 3.1, 3.2, 3.3

### 5.1.4 Project Management Properties

**Property 4: Project CRUD operations maintain referential integrity**

For any project operation (create, update, delete), the project's user reference must always point to the authenticated user performing the operation. This property prevents authorization bypass vulnerabilities where a user might manipulate project IDs to access or modify another user's projects. The test generates random project data and user IDs, attempting operations with mismatched credentials to verify that unauthorized access is blocked.

**Test Location:** `backend/src/tests/project.property.test.js`

**Validates:** Requirements 5.2, 7.2, 8.2

**Property 5: GitHub re-sync preserves custom projects**

For any user with both GitHub-imported and custom projects, running re-sync must update GitHub projects but never delete or modify custom projects (those without `githubRepoId`). The test creates a mix of project types, triggers re-sync, and verifies that:
- Projects with `githubRepoId` are updated with latest GitHub data
- Projects without `githubRepoId` remain unchanged
- No custom projects are deleted during the sync operation

**Property 6: GitHub re-sync upserts correctly**

For any GitHub repository that already exists in the database (matched by `githubRepoId`), re-sync must update its fields rather than creating a duplicate. The test simulates multiple sync operations with changing repository data and verifies that:
- Each repository appears exactly once in the database
- Updated fields (description, language) reflect the latest GitHub data
- The `githubRepoId` uniqueness constraint is maintained

**Test Locations:**
- `backend/src/tests/resync-preservation.property.test.js`
- `backend/src/tests/resync-upsert.property.test.js`

**Validates:** Requirements 6.2

### 5.1.5 Appearance Properties

**Property 8: Appearance changes reflect immediately**

For any layout template or theme selection, saving the change must update the user's database record and the public portfolio must render with the new appearance on next load. The test generates random appearance configurations and verifies that:
- The user document is updated with the selected template and theme
- The `/api/:username` endpoint returns the updated appearance settings
- The changes persist across sessions

**Test Location:** `backend/src/tests/appearance.property.test.js`

**Validates:** Requirements 11.2, 11.3, 12.2, 12.3

### 5.1.6 Authentication Properties

**Property 9: Unauthenticated access is blocked**

For any dashboard API endpoint, requests without a valid session must return 401 Unauthorized and not modify any data. The test attempts to access protected endpoints without authentication and verifies that:
- All protected routes return 401 status
- No database modifications occur
- Session cookies are required for access

**Test Location:** `backend/src/tests/auth-blocking.property.test.js`

**Validates:** Requirements 1.3

**Property 10: Project deletion confirmation prevents accidents**

For any project deletion request, the operation should only proceed after explicit user confirmation. While this property is primarily enforced at the UI level, the backend test verifies that deletion endpoints require explicit intent signals (such as a confirmation parameter) to prevent accidental data loss through automated scripts or API misuse.

**Test Location:** `backend/src/tests/deletion-confirmation.property.test.js`

**Validates:** Requirements 8.1, 8.2

## 5.2 Unit Testing

Unit testing targets the smallest testable units of the application in isolation, independent of the database, GitHub API, or any other external dependency. The primary candidates for unit testing in Codefolio are the field mapping functions that extract and transform GitHub API response data into the User and Project document schemas defined in the data model.

### 5.2.1 GitHub Data Mapping

The `fetchAndSaveRepos` function in `backend/src/utils/github.js` is responsible for mapping GitHub repository objects to Project documents. Unit tests verify that:
- Repository name maps to `title`
- Repository description maps to `description` (with empty string fallback for null)
- Repository HTML URL maps to `githubLink`
- Repository language maps to `language` (with empty string fallback for null)
- Repository ID maps to `githubRepoId` for upsert operations
- Fork repositories are correctly filtered out

Edge cases tested include:
- Repositories with null description fields
- Repositories with no detected primary language
- Repositories with no homepage value
- Repositories marked as forks

### 5.2.2 Input Validation

Routes that accept PATCH requests for updating user profile fields, skill arrays, or project descriptions are tested by passing malformed or missing request bodies and asserting that the appropriate HTTP error responses are returned before any database operation is attempted.

**Profile Validation Tests:**
- Empty bio strings are accepted (users can clear their bio)
- Bio strings exceeding reasonable length limits are rejected
- Location strings with special characters are sanitized
- Social media URLs are validated for correct format
- Invalid URLs return 400 Bad Request with descriptive error messages

**Project Validation Tests:**
- Required fields (title, user reference) are enforced
- Optional fields (description, liveDemo, imageUrl) accept null values
- GitHub repository IDs must be unique across the system
- Tech stack arrays accept string values only

## 5.3 Integration Testing

Integration testing targets the interactions between the application layer and its two primary external dependencies: MongoDB and the GitHub API.

### 5.3.1 GitHub OAuth Flow

The GitHub OAuth callback route (`/api/auth/github/callback`) is the most critical integration point in the system. It is responsible for:
1. Exchanging an authorization code for an access token
2. Retrieving the user's GitHub profile
3. Determining whether an account already exists in the database
4. Either creating a new User document or loading an existing one
5. Populating the session with user data

This flow is tested using mocked GitHub API responses to simulate both the first-time user and returning user paths, with assertions verifying that:
- The correct database operations are performed in each case
- The session is correctly populated on completion
- The user is redirected to the dashboard
- The session cookie is set with correct security attributes

**First-time User Path:**
- User document is created with GitHub profile data
- `fetchAndSaveRepos` is called to import repositories
- User is redirected to dashboard
- Session contains user ID and profile data

**Returning User Path:**
- Existing user document is loaded from database
- No repository import occurs (only on first sign-up)
- User is redirected to dashboard
- Session is updated with latest profile data

### 5.3.2 Database Transaction Testing

Integration tests verify that multi-step database operations maintain consistency:

**Education Management:**
- Creating an education entry adds it to both the Education collection and the user's education array
- Deleting an education entry removes it from both locations
- Failed operations roll back completely (no orphaned references)

**Project Management:**
- Creating a custom project links it to the user
- Deleting a project removes it from the user's project list
- GitHub re-sync operations use upsert correctly to avoid duplicates

### 5.3.3 Session Persistence

Integration tests verify that session data persists correctly across requests:
- Session cookies are set with correct attributes (httpOnly, secure, sameSite)
- Session data is stored in MongoDB via MongoStore
- Sessions expire after the configured timeout (24 hours)
- Logout correctly destroys the session

## 5.4 End-to-End Testing

End-to-end (E2E) testing validates complete user workflows from the browser through the full application stack. Codefolio uses Cypress for E2E testing, with tests organized by user journey.

### 5.4.1 Complete User Flow

**Test:** `frontend/cypress/e2e/user-flow.cy.js`

This test simulates a new user's complete journey through the application:
1. User visits the landing page
2. User clicks "Join for Free" and is redirected to GitHub OAuth
3. User authorizes the application (mocked in test environment)
4. User is redirected to dashboard
5. User edits their bio and location
6. User adds skills
7. User views their public portfolio
8. User verifies that changes are visible on the portfolio page

**Validates:** Requirements 1.1, 1.2, 2.1, 2.2, 2.3, 2.4, 3.1, 3.2

### 5.4.2 Project Management Flow

**Test:** `frontend/cypress/e2e/project-management.cy.js`

This test validates the complete project management workflow:
1. User navigates to Projects section in dashboard
2. User views imported GitHub projects
3. User clicks "Add Custom Project"
4. User fills out project form (title, description, tech stack, live demo URL)
5. User saves the project
6. User edits an existing project
7. User deletes a project with confirmation
8. User triggers GitHub re-sync
9. User verifies that custom projects are preserved after re-sync

**Validates:** Requirements 4.1, 4.2, 5.1, 5.2, 5.3, 6.1, 6.2, 6.3, 7.1, 7.2, 8.1, 8.2, 8.3

### 5.4.3 Education Management Flow

**Test:** `frontend/cypress/e2e/education-management.cy.js`

This test validates education entry management:
1. User navigates to Education section
2. User clicks "Add Education"
3. User fills out education form (institution, degree, field of study, dates)
4. User saves the entry
5. User edits an existing entry
6. User deletes an entry with confirmation
7. User verifies chronological ordering (most recent first)

**Validates:** Requirements 10.1, 10.2, 10.3, 10.4

### 5.4.4 GitHub Re-Sync Flow

**Test:** `frontend/cypress/e2e/github-resync.cy.js`

This test specifically validates the GitHub repository re-sync feature:
1. User has existing projects (both GitHub and custom)
2. User clicks "Re-Sync GitHub" button
3. Loading state is displayed
4. Re-sync completes successfully
5. GitHub projects are updated with latest data
6. Custom projects remain unchanged
7. Success message is displayed

**Validates:** Requirements 6.1, 6.2, 6.3, 6.4

### 5.4.5 Appearance Changes Flow

**Test:** `frontend/cypress/e2e/appearance-changes.cy.js`

This test validates appearance customization:
1. User navigates to Appearance section
2. User selects a different layout template
3. User selects a different theme
4. User saves changes
5. User clicks "View Portfolio"
6. User verifies that portfolio displays with new layout and theme
7. User returns to dashboard and verifies settings are persisted

**Validates:** Requirements 11.1, 11.2, 11.3, 12.1, 12.2, 12.3

## 5.5 Continuous Integration

All tests are executed automatically on every push to the main branch via GitHub Actions. The CI pipeline is defined in `.github/workflows/test.yml` and includes:

**Backend Tests:**
- Property-based tests (fast-check)
- Unit tests
- Integration tests
- Runs on Node.js 18.x and 20.x

**Frontend Tests:**
- Cypress E2E tests
- Runs against a test database
- Uses mocked GitHub OAuth for authentication

**Test Coverage Requirements:**
- Backend: Minimum 80% code coverage
- Frontend: All critical user paths must pass E2E tests
- Property-based tests: Minimum 100 iterations per property

## 5.6 Test Execution

### Running Tests Locally

**Backend Tests:**
```bash
cd backend
npm test                    # Run all tests
npm run test:watch         # Run tests in watch mode
npm run test:coverage      # Generate coverage report
```

**Frontend E2E Tests:**
```bash
cd frontend
npm run cypress:open       # Open Cypress UI
npm run cypress:run        # Run tests headlessly
```

### Test Configuration

**Property-Based Test Configuration:**
- Each property test runs 100 iterations by default
- Configurable via `fc.assert` parameters
- Seed values are logged for reproducibility

**Cypress Configuration:**
- Base URL: `http://localhost:5173` (Vite dev server)
- API URL: `http://localhost:5000` (Express server)
- Test isolation: Each test starts with a clean database state
- Viewport: 1280x720 (desktop), 375x667 (mobile)

## 5.7 Test Maintenance

### Adding New Tests

When adding new features, follow this testing hierarchy:

1. **Define correctness properties** in the design document
2. **Implement property-based tests** to verify universal properties
3. **Add unit tests** for isolated logic components
4. **Add integration tests** for database and API interactions
5. **Add E2E tests** for complete user workflows

### Test Naming Conventions

**Property-Based Tests:**
- File: `<feature>.property.test.js`
- Test name: `Property N: <property description>`
- Comment: `**Feature: <feature-name>, Property N: <property-text>**`
- Comment: `**Validates: Requirements X.Y**`

**Unit Tests:**
- File: `<component>.test.js`
- Test name: Descriptive of the specific behavior being tested

**E2E Tests:**
- File: `<workflow>.cy.js`
- Test name: Descriptive of the user journey

### Debugging Failed Tests

**Property-Based Test Failures:**
- fast-check logs the failing input that caused the property violation
- Use the seed value to reproduce the exact failure
- Add the failing case as a regression test

**E2E Test Failures:**
- Cypress captures screenshots and videos of failures
- Check `frontend/cypress/screenshots` and `frontend/cypress/videos`
- Use `cy.debug()` to pause execution and inspect state

## 5.8 Known Limitations

**Property-Based Testing:**
- Properties are probabilistic, not exhaustive
- 100 iterations provide strong evidence but not mathematical proof
- Complex properties may require custom generators

**E2E Testing:**
- GitHub OAuth is mocked in test environment
- Real GitHub API rate limits are not tested
- Production deployment scenarios are not covered

**Integration Testing:**
- MongoDB transactions are not tested (single-document operations only)
- Network failures and timeouts are not simulated
- Concurrent user scenarios are not tested

## 5.9 Future Testing Enhancements

**Planned Improvements:**
- Increase property test iterations to 1000 for critical properties
- Add mutation testing to verify test suite effectiveness
- Implement visual regression testing for UI components
- Add performance testing for GitHub re-sync with large repositories
- Add load testing for concurrent user sessions
- Implement contract testing for GitHub API integration
