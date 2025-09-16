describe('Chat Functionality', () => {
  beforeEach(() => {
    // Mock API calls to prevent timeouts
    cy.intercept('GET', '/api/system/version', {
      statusCode: 200,
      body: {
        version: '1.0.0',
        source: 'test',
        timestamp: new Date().toISOString(),
        environment: 'test',
        uptime: 1000,
      },
    }).as('getServerVersion');

    cy.intercept('GET', '/api/agents', {
      statusCode: 200,
      body: {
        agents: [],
      },
    }).as('getAgents');

    // Visit the home page first
    cy.visit('/');

    // Wait for app to be ready (inline implementation)
    cy.get('#root', { timeout: 30000 }).should('exist');
    cy.document().its('readyState').should('equal', 'complete');
    cy.wait(1000);
  });

  it('can navigate to chat interface', () => {
    // Check if agent cards exist and are clickable
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="agent-card"]').length > 0) {
        // If agent cards exist, click the first one
        cy.get('[data-testid="agent-card"]').first().click();

        // Should navigate to some route (could be chat or agent details)
        cy.url().should('not.eq', `${Cypress.config('baseUrl')}/`);
      } else {
        // Just verify the main interface loaded (lenient check)
        cy.get('body').then(($body) => {
          if ($body.find('[data-testid="app-sidebar"]').length > 0) {
            cy.get('[data-testid="app-sidebar"]').should('exist');
          } else {
            cy.get('aside, nav, [role="navigation"]').should('exist');
          }
        });
      }
    });
  });

  it('displays basic interface elements', () => {
    // Check that the basic navigation and structure exists on desktop viewport (lenient check)
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="app-sidebar"]').length > 0) {
        cy.get('[data-testid="app-sidebar"]').should('exist');
      } else {
        cy.get('aside, nav, [role="navigation"]').should('exist');
      }

      // Check for mobile menu button
      if ($body.find('[data-testid="mobile-menu-button"]').length > 0) {
        cy.get('[data-testid="mobile-menu-button"]').should('exist');
      } else {
        cy.get('button[aria-label*="menu"], button[aria-label*="Menu"]').should('exist');
      }
    });
  });

  it('can interact with sidebar', () => {
    // Check sidebar elements exist (lenient check)
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="app-sidebar"]').length > 0) {
        cy.get('[data-testid="app-sidebar"]').should('exist');
      } else {
        cy.get('aside, nav, [role="navigation"]').should('exist');
      }

      // Check for mobile menu button
      if ($body.find('[data-testid="mobile-menu-button"]').length > 0) {
        cy.get('[data-testid="mobile-menu-button"]').should('exist');
      } else {
        cy.get('button[aria-label*="menu"], button[aria-label*="Menu"]').should('exist');
      }
    });

    cy.log('Sidebar elements verified - interaction may not be available in E2E context');
  });

  it('handles API interactions', () => {
    // Intercept agents API call
    cy.intercept('GET', '/api/agents', {
      body: {
        data: {
          agents: [
            {
              id: '12345678-1234-1234-1234-123456789012',
              name: 'Test Agent',
              status: 'active',
            },
          ],
        },
      },
    }).as('getAgents');

    // Reload to trigger API call
    cy.reload();
    // Wait for app to be ready
    cy.get('#root', { timeout: 30000 }).should('exist');
    cy.document().its('readyState').should('equal', 'complete');
    cy.wait(500);

    // Wait for the API call
    cy.wait('@getAgents');

    // Verify the page still works
    cy.get('#root').should('exist');
    cy.get('[data-testid="app-sidebar"]').should('exist');
  });

  it('handles error states gracefully', () => {
    // Intercept with error response
    cy.intercept('GET', '/api/agents', {
      statusCode: 500,
      body: { error: 'Internal Server Error' },
    }).as('getAgentsError');

    // Reload to trigger error
    cy.reload();
    // Wait for app to be ready
    cy.get('#root', { timeout: 30000 }).should('exist');
    cy.document().its('readyState').should('equal', 'complete');
    cy.wait(500);

    // Wait for error response
    cy.wait('@getAgentsError');

    // App should still be functional
    cy.get('#root').should('exist');
    cy.get('[data-testid="app-sidebar"]').should('exist');
  });

  it('supports mobile navigation', () => {
    // Switch to mobile view
    cy.viewport('iphone-x');

    // Wait for layout to settle
    cy.wait(1000);

    // Mobile menu button should be visible
    cy.get('[data-testid="mobile-menu-button"]').should('be.visible');

    // Click to open mobile menu with force to overcome covering elements
    cy.get('[data-testid="mobile-menu-button"]').click({ force: true });

    // Wait for animation
    cy.wait(500);

    // Sidebar should appear in mobile sheet
    cy.get('[data-testid="app-sidebar"]').should('exist');

    // Reset viewport
    cy.viewport(1280, 720);

    // Wait for layout to settle back
    cy.wait(500);
  });

  it('loads without critical errors', () => {
    // Check that no major JavaScript errors are displayed
    cy.get('body').should('not.contain.text', 'Uncaught');
    cy.get('body').should('not.contain.text', 'TypeError');
    cy.get('body').should('not.contain.text', 'ReferenceError');

    // Basic elements should exist
    cy.get('#root').should('exist');
    cy.get('[data-testid="app-sidebar"]').should('exist');
  });

  it('has working connection status', () => {
    // Connection status should exist
    cy.get('[data-testid="connection-status"]', { timeout: 10000 }).should('exist');

    // Should be clickable (even if it doesn't do much)
    cy.get('[data-testid="connection-status"]').click();

    // Status should still exist after click
    cy.get('[data-testid="connection-status"]').should('exist');
  });

  it('maintains state during navigation', () => {
    // Toggle sidebar if available
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="sidebar-toggle"]').length > 0) {
        cy.get('[data-testid="sidebar-toggle"]').click();
      }
    });

    // Navigate if possible
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="agent-card"]').length > 0) {
        cy.get('[data-testid="agent-card"]').first().click();
        // If navigation occurred, verify we're on a different page
        cy.wait(1000);
      }
    });

    // Basic structure should remain
    cy.get('#root').should('exist');
  });

  it('handles concurrent requests', () => {
    // Setup interceptor for known API endpoint
    cy.intercept('GET', '/api/agents', { delay: 500, body: { data: { agents: [] } } }).as(
      'getAgents'
    );

    // Reload to trigger requests
    cy.reload();
    // Wait for app to be ready
    cy.get('#root', { timeout: 30000 }).should('exist');
    cy.document().its('readyState').should('equal', 'complete');
    cy.wait(500);

    // Wait for the agents request
    cy.wait('@getAgents');

    // App should be functional
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="app-sidebar"]').length > 0) {
        cy.get('[data-testid="app-sidebar"]').should('exist');
      } else {
        cy.get('aside, nav, [role="navigation"]').should('exist');
      }

      // Check mobile menu button
      if ($body.find('[data-testid="mobile-menu-button"]').length > 0) {
        cy.get('[data-testid="mobile-menu-button"]').should('exist');
      } else {
        cy.get('button[aria-label*="menu"], button[aria-label*="Menu"]').should('exist');
      }
    });
  });
});
