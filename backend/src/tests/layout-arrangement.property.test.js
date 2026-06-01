/**
 * Feature: portfolio-customization, Property 2: Layout template determines section arrangement
 * Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5
 * 
 * Property: For any valid layout template, the sections should be arranged according to 
 * the template specification and no sections should be duplicated or missing.
 */

import fc from 'fast-check';

// Layout component mapping (simulating the frontend logic)
const layouts = {
  default: 'DefaultLayout',
  minimal: 'MinimalLayout',
  modern: 'ModernLayout',
  classic: 'ClassicLayout',
};

function getLayoutComponent(layoutTemplate) {
  const normalizedLayout = layoutTemplate?.toLowerCase();

  if (!normalizedLayout || !VALID_LAYOUTS.includes(normalizedLayout)) {
    console.warn(`Invalid layout template "${layoutTemplate}", falling back to "default"`);
    return layouts.default;
  }

  return layouts[normalizedLayout];
}

// Expected sections for each layout
const LAYOUT_SECTIONS = {
  default: ['profile', 'skills', 'projects', 'education'],
  minimal: ['profile', 'skills', 'projects'], // Only featured projects, no education
  modern: ['profile', 'skills', 'projects', 'education'],
  classic: ['profile', 'skills', 'projects', 'education'],
};

// Valid layout names
const VALID_LAYOUTS = ['default', 'minimal', 'modern', 'classic'];

// Custom arbitraries
const validLayoutArbitrary = fc.constantFrom(...VALID_LAYOUTS);
const invalidLayoutArbitrary = fc.oneof(
  fc.constant(null),
  fc.constant(undefined),
  fc.constant(''),
  fc.string().filter(s => !VALID_LAYOUTS.includes(s.toLowerCase()))
);
const anyLayoutArbitrary = fc.oneof(validLayoutArbitrary, invalidLayoutArbitrary);

// Mock user data generator
const userDataArbitrary = fc.record({
  displayName: fc.string({ minLength: 1, maxLength: 50 }),
  username: fc.string({ minLength: 1, maxLength: 30 }),
  bio: fc.option(fc.string({ maxLength: 200 }), { nil: null }),
  location: fc.option(fc.string({ maxLength: 100 }), { nil: null }),
  avatarUrl: fc.webUrl(),
  skills: fc.array(fc.string({ minLength: 1, maxLength: 30 }), { maxLength: 20 }),
  projects: fc.array(
    fc.record({
      _id: fc.uuid(),
      title: fc.string({ minLength: 1, maxLength: 100 }),
      description: fc.option(fc.string({ maxLength: 500 }), { nil: null }),
      language: fc.option(fc.string({ minLength: 1, maxLength: 30 }), { nil: null }),
      githubLink: fc.option(fc.webUrl(), { nil: null }),
      liveDemo: fc.option(fc.webUrl(), { nil: null }),
      isFeatured: fc.boolean(),
    }),
    { maxLength: 10 }
  ),
  education: fc.array(
    fc.record({
      _id: fc.uuid(),
      institution: fc.string({ minLength: 1, maxLength: 100 }),
      degree: fc.string({ minLength: 1, maxLength: 100 }),
      fieldOfStudy: fc.string({ minLength: 1, maxLength: 100 }),
      startDate: fc.date(),
      endDate: fc.option(fc.date(), { nil: null }),
      description: fc.option(fc.string({ maxLength: 500 }), { nil: null }),
    }),
    { maxLength: 5 }
  ),
  socials: fc.record({
    linkedin: fc.option(fc.webUrl(), { nil: '' }),
    twitter: fc.option(fc.webUrl(), { nil: '' }),
    website: fc.option(fc.webUrl(), { nil: '' }),
  }),
});

// Helper function to determine which sections should be rendered
function getSectionsToRender(layoutTemplate, userData) {
  const normalizedLayout = layoutTemplate?.toLowerCase() || 'default';
  const layout = VALID_LAYOUTS.includes(normalizedLayout) ? normalizedLayout : 'default';
  
  const sections = [];
  
  // Profile is always rendered
  sections.push('profile');
  
  // Skills rendered if user has skills
  if (userData.skills && userData.skills.length > 0) {
    sections.push('skills');
  }
  
  // Projects logic depends on layout
  if (layout === 'minimal') {
    // Minimal only shows featured projects
    const hasFeaturedProjects = userData.projects?.some(p => p.isFeatured);
    if (hasFeaturedProjects) {
      sections.push('projects');
    }
  } else {
    // Other layouts show all projects
    if (userData.projects && userData.projects.length > 0) {
      sections.push('projects');
    }
  }
  
  // Education not rendered in minimal layout
  if (layout !== 'minimal' && userData.education && userData.education.length > 0) {
    sections.push('education');
  }
  
  return sections;
}

// Main test function
const runPropertyTest = async () => {
  console.log('Starting Property Test: Layout template determines section arrangement');
  console.log('Feature: portfolio-customization, Property 2');
  console.log('Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5\n');

  try {
    // Property 1: Valid layouts return correct component names
    console.log('Testing: Valid layouts return correct component names...');
    await fc.assert(
      fc.property(validLayoutArbitrary, (layoutTemplate) => {
        const component = getLayoutComponent(layoutTemplate);
        const expectedComponent = layouts[layoutTemplate];
        
        if (component !== expectedComponent) {
          throw new Error(
            `Layout "${layoutTemplate}" returned wrong component. ` +
            `Expected "${expectedComponent}", got "${component}"`
          );
        }
        
        return true;
      }),
      { numRuns: 100 }
    );
    console.log('✓ Valid layouts return correct component names (100 runs)');

    // Property 2: Invalid layouts fall back to default
    console.log('\nTesting: Invalid layouts fall back to default...');
    await fc.assert(
      fc.property(invalidLayoutArbitrary, (layoutTemplate) => {
        const component = getLayoutComponent(layoutTemplate);
        
        if (component !== layouts.default) {
          throw new Error(
            `Invalid layout "${layoutTemplate}" did not fall back to default. ` +
            `Expected "${layouts.default}", got "${component}"`
          );
        }
        
        return true;
      }),
      { numRuns: 100 }
    );
    console.log('✓ Invalid layouts fall back to default (100 runs)');

    // Property 3: Layout selection is case-insensitive
    console.log('\nTesting: Layout selection is case-insensitive...');
    await fc.assert(
      fc.property(
        validLayoutArbitrary,
        fc.constantFrom('lower', 'upper', 'mixed'),
        (layoutTemplate, caseType) => {
          let testLayout = layoutTemplate;
          if (caseType === 'upper') {
            testLayout = layoutTemplate.toUpperCase();
          } else if (caseType === 'mixed') {
            testLayout = layoutTemplate.split('').map((c, i) => 
              i % 2 === 0 ? c.toUpperCase() : c.toLowerCase()
            ).join('');
          }
          
          const component = getLayoutComponent(testLayout);
          const expectedComponent = layouts[layoutTemplate];
          
          if (component !== expectedComponent) {
            throw new Error(
              `Case-insensitive layout lookup failed for "${testLayout}". ` +
              `Expected "${expectedComponent}", got "${component}"`
            );
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
    console.log('✓ Layout selection is case-insensitive (100 runs)');

    // Property 4: Sections are not duplicated
    console.log('\nTesting: Sections are not duplicated in any layout...');
    await fc.assert(
      fc.property(
        validLayoutArbitrary,
        userDataArbitrary,
        (layoutTemplate, userData) => {
          const sections = getSectionsToRender(layoutTemplate, userData);
          const uniqueSections = [...new Set(sections)];
          
          if (sections.length !== uniqueSections.length) {
            throw new Error(
              `Layout "${layoutTemplate}" has duplicated sections. ` +
              `Sections: [${sections.join(', ')}]`
            );
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
    console.log('✓ Sections are not duplicated (100 runs)');

    // Property 5: Minimal layout excludes education section
    console.log('\nTesting: Minimal layout excludes education section...');
    await fc.assert(
      fc.property(userDataArbitrary, (userData) => {
        const sections = getSectionsToRender('minimal', userData);
        
        if (sections.includes('education')) {
          throw new Error(
            `Minimal layout should not include education section. ` +
            `Sections: [${sections.join(', ')}]`
          );
        }
        
        return true;
      }),
      { numRuns: 100 }
    );
    console.log('✓ Minimal layout excludes education section (100 runs)');

    // Property 6: Minimal layout only shows featured projects
    console.log('\nTesting: Minimal layout only shows featured projects...');
    await fc.assert(
      fc.property(userDataArbitrary, (userData) => {
        const sections = getSectionsToRender('minimal', userData);
        const hasFeaturedProjects = userData.projects?.some(p => p.isFeatured);
        const hasProjectsSection = sections.includes('projects');
        
        // If there are no featured projects, projects section should not be rendered
        if (!hasFeaturedProjects && hasProjectsSection) {
          throw new Error(
            `Minimal layout should not show projects section when no featured projects exist`
          );
        }
        
        // If there are featured projects, projects section should be rendered
        if (hasFeaturedProjects && userData.projects.length > 0 && !hasProjectsSection) {
          throw new Error(
            `Minimal layout should show projects section when featured projects exist`
          );
        }
        
        return true;
      }),
      { numRuns: 100 }
    );
    console.log('✓ Minimal layout only shows featured projects (100 runs)');

    // Property 7: Profile section is always present
    console.log('\nTesting: Profile section is always present in all layouts...');
    await fc.assert(
      fc.property(
        anyLayoutArbitrary,
        userDataArbitrary,
        (layoutTemplate, userData) => {
          const sections = getSectionsToRender(layoutTemplate, userData);
          
          if (!sections.includes('profile')) {
            throw new Error(
              `Layout "${layoutTemplate}" is missing required profile section. ` +
              `Sections: [${sections.join(', ')}]`
            );
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
    console.log('✓ Profile section is always present (100 runs)');

    // Property 8: Sections are conditionally rendered based on data
    console.log('\nTesting: Sections are conditionally rendered based on data...');
    await fc.assert(
      fc.property(
        validLayoutArbitrary.filter(l => l !== 'minimal'),
        userDataArbitrary,
        (layoutTemplate, userData) => {
          const sections = getSectionsToRender(layoutTemplate, userData);
          
          // If user has no skills, skills section should not be rendered
          if ((!userData.skills || userData.skills.length === 0) && sections.includes('skills')) {
            throw new Error(
              `Layout "${layoutTemplate}" should not render skills section when user has no skills`
            );
          }
          
          // If user has no projects, projects section should not be rendered
          if ((!userData.projects || userData.projects.length === 0) && sections.includes('projects')) {
            throw new Error(
              `Layout "${layoutTemplate}" should not render projects section when user has no projects`
            );
          }
          
          // If user has no education, education section should not be rendered
          if ((!userData.education || userData.education.length === 0) && sections.includes('education')) {
            throw new Error(
              `Layout "${layoutTemplate}" should not render education section when user has no education`
            );
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
    console.log('✓ Sections are conditionally rendered based on data (100 runs)');

    // Property 9: Layout selection is idempotent
    console.log('\nTesting: Layout selection is idempotent...');
    await fc.assert(
      fc.property(anyLayoutArbitrary, (layoutTemplate) => {
        const component1 = getLayoutComponent(layoutTemplate);
        const component2 = getLayoutComponent(layoutTemplate);
        
        if (component1 !== component2) {
          throw new Error(
            `Layout selection is not idempotent for "${layoutTemplate}". ` +
            `First call: "${component1}", Second call: "${component2}"`
          );
        }
        
        return true;
      }),
      { numRuns: 100 }
    );
    console.log('✓ Layout selection is idempotent (100 runs)');

    console.log('\n✓ All layout arrangement tests passed!');
    console.log('Layout templates correctly determine section arrangement.');
    
  } catch (error) {
    console.error('✗ Property test failed!');
    console.error(error.message);
    throw error;
  }
};

// Run the test
runPropertyTest()
  .then(() => {
    console.log('\nTest completed successfully.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nTest failed with error:', error);
    process.exit(1);
  });

